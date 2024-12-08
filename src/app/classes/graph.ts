import { Activity } from './dfg/activities';

export interface GraphJson {
    nodes: NodeJson[];
    edges: EdgeJson[];
}
export class Graph {
    constructor(
        readonly nodes: Node[],
        readonly edges: Edge[],
    ) {}

    asJson(): GraphJson {
        return {
            nodes: this.nodes.map((n) => n.asJson()),
            edges: this.edges.map((e) => e.asJson()),
        };
    }
}

export interface NodeJson {
    id: string;
    x: number;
    y: number;
}

export class Node {
    constructor(
        private _id: string,
        private _x: number,
        private _y: number,
    ) {}

    get id(): string {
        return this._id;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    equals(other: Node): boolean {
        return (
            this._id === other._id &&
            this._x === other._x &&
            this._y === other._y
        );
    }

    addYOffset(offset: number): void {
        this._y += offset;
    }

    isNodeOverlapped(node: Node): boolean {
        return this._id !== node.id && this._x === node.x && this._y === node.y;
    }

    asJson(): NodeJson {
        return {
            id: this._id,
            x: this._x,
            y: this._y,
        };
    }
}

export interface EdgeJson {
    source: NodeJson;
    target: NodeJson;
}

export class Edge {
    private readonly _gradient: number;
    private readonly _yAxisPoint: number;

    constructor(
        private _source: Node,
        private _target: Node,
    ) {
        this._gradient =
            (this._target.y - this._source.y) /
            (this._target.x - this._source.x);

        this._yAxisPoint = this._source.y - this._gradient * this._source.x;
    }

    get source(): Node {
        return this._source;
    }

    get target(): Node {
        return this._target;
    }

    equals(other: Edge): boolean {
        return this._source === other._source && this._target === other._target;
    }

    isNodeStartOrEndNode(node: Node): boolean {
        return this._source.id === node.id || this._target.id === node.id;
    }

    isNodeOnSameHorizontalLevel(node: Node): boolean {
        return this._source.y === node.y && this._target.y === node.y;
    }

    isNodeOnEdgeAndOnSameHorizontalLevel(node: Node): boolean {
        return node.x < this._target.x && node.x > this._source.x;
    }

    distanceToNode(node: Node): number {
        return (
            Math.abs(this._gradient * node.x + -1 * node.y + this._yAxisPoint) /
            Math.sqrt(Math.pow(this._gradient, 2) + Math.pow(-1, 2))
        );
    }

    asJson(): EdgeJson {
        return {
            source: this._source.asJson(),
            target: this._target.asJson(),
        };
    }
}

export interface StackElement {
    activity: Activity;
    source_x: number;
    source_y: number;
}
