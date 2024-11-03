export class Vertex {
    id: string;
    name: string;
    x: number;
    y: number;
    svgElement: SVGElement | undefined;

    constructor(id: string, name: string, x: number, y: number) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
    }

    public registerSvg(svgElement: SVGElement): void {
        this.svgElement = svgElement;
    }
}

export class Edge {
    id: string;
    start: Vertex;
    end: Vertex;
    svgElement: SVGElement | undefined;

    constructor(id: string, start: Vertex, end: Vertex) {
        this.id = id;
        this.start = start;
        this.end = end;
    }

    public registerSvg(svgElement: SVGElement): void {
        this.svgElement = svgElement;
    }
}

export class Graph {
    vertices: Set<Vertex> = new Set<Vertex>();
    edges: Set<Edge> = new Set<Edge>();

    getAndAddVertex(vertex: Vertex): Vertex {
        let existingVertex: Vertex | undefined;

        this.vertices.forEach((v) => {
            if (v.id === vertex.id) existingVertex = v;
        });

        if (existingVertex === undefined) {
            this.vertices.add(vertex);
            return vertex;
        }

        return existingVertex;
    }

    getAndAddEdge(e: Edge): Edge {
        let existingEdge: Edge | undefined;

        this.edges.forEach((edge) => {
            if (e.id === edge.id) existingEdge = edge;
        });

        if (existingEdge === undefined) {
            this.edges.add(e);
            return e;
        }

        return existingEdge;
    }
}
