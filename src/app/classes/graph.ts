import { environment } from 'src/environments/environment';
import { Place } from '../components/drawing-area';
import { Activity } from './dfg/activities';
import { PetriNetTransition } from './petrinet/petri-net-transitions';
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

    getSize(): [number, number] {
        return [
            Math.max(...this.nodes.map((node) => node.x)),
            Math.max(...this.nodes.map((node) => node.y)),
        ];
    }
}

export interface NodeJson {
    id: string;
    x: number;
    y: number;
}

export abstract class Node {
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

    set x(x: number) {
        this._x = x;
    }

    set y(y: number) {
        this._y = y;
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

    getXOffset(): number {
        return this._x;
    }

    asJson(): NodeJson {
        return {
            id: this._id,
            x: this._x,
            y: this._y,
        };
    }
}

// This dummy is used for box intersection calculation
export class DummyNode extends Node {}

export class ActivityNode extends Node {
    constructor(
        _id: string,
        _x: number,
        _y: number,
        private _dfgId: string,
    ) {
        super(_id, _x, _y);
    }

    get dfg(): string {
        return this._dfgId;
    }
}

export class PlaceNode extends Node {}

export class TransitionNode extends Node {
    constructor(
        _id: string,
        _x: number,
        _y: number,
        private _name: string,
    ) {
        super(_id, _x, _y);
    }

    get name(): string {
        return this._name;
    }
}

export class InvisibleTransitionNode extends TransitionNode {}

export class BoxNode extends Node {
    constructor(
        _id: string,
        _x: number,
        _y: number,
        private _width: number,
        private _height: number,
        private _eventLog: string,
    ) {
        super(_id, _x, _y);
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get eventLog(): string {
        return this._eventLog;
    }

    override getXOffset(): number {
        return super.x + this._width / 2;
    }

    isNodeOutsideOfBox(node: Node): boolean {
        if (node.id === this.id) {
            return true;
        }

        let nodeWidth: number = 0;
        let nodeHeight: number = 0;

        if (node instanceof PlaceNode) {
            nodeWidth = environment.drawingElements.places.radius * 2;
            nodeHeight = nodeWidth;
        }

        if (node instanceof TransitionNode) {
            nodeWidth = environment.drawingElements.transitions.width;
            nodeHeight = environment.drawingElements.transitions.height;
        }

        const strokeWidth: number =
            environment.drawingElements.boxes.strokeWidth;

        const xBoxLeft: number = this.x - (this._width + strokeWidth) / 2;
        const xBoxRight: number = this.x + (this._width + strokeWidth) / 2;
        const yBoxTop: number = this.y - (this._height + strokeWidth) / 2;
        const yBoxBottom: number = this.y + (this._height + strokeWidth) / 2;

        const xNodeLeft: number = node.x - nodeWidth / 2;
        const xNodeRight: number = node.x + nodeWidth / 2;
        const yNodeTop: number = node.y - nodeHeight / 2;
        const yNodeBottom: number = node.y + nodeHeight / 2;

        return (
            this.isNodeOnXOutsideOfBox(
                xBoxLeft,
                xBoxRight,
                xNodeLeft,
                xNodeRight,
            ) ||
            this.isNodeOnYOutsideOfBox(
                yBoxTop,
                yBoxBottom,
                yNodeTop,
                yNodeBottom,
            )
        );
    }

    private isNodeOnXOutsideOfBox(
        xBoxLeft: number,
        xBoxRight: number,
        xNodeLeft: number,
        xNodeRight: number,
    ): boolean {
        return xNodeRight < xBoxLeft || xNodeLeft > xBoxRight;
    }

    private isNodeOnYOutsideOfBox(
        yBoxTop: number,
        yBoxBottom: number,
        yNodeTop: number,
        yNodeBottom: number,
    ): boolean {
        return yNodeBottom < yBoxTop || yNodeTop > yBoxBottom;
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
        return this._source.x < this._target.x
            ? node.x < this._target.x && node.x > this._source.x
            : node.x > this._target.x && node.x < this._source.x;
    }

    distanceToNode(node: Node): number {
        return (
            Math.abs(this._gradient * node.x + -1 * node.y + this._yAxisPoint) /
            Math.sqrt(Math.pow(this._gradient, 2) + Math.pow(-1, 2))
        );
    }

    intersectsBox(node: BoxNode): boolean {
        if (node.id === 'dfg2') {
            const boxRightDownCornerX = node.x + node.width / 2;
            const boxRightDownCornerY = node.y + node.height / 2;
        }
        const boxStroke: number = environment.drawingElements.boxes.strokeWidth;

        const xBoxLeft: number = node.x - (node.width + boxStroke) / 2;
        const xBoxRight: number = node.x + (node.width + boxStroke) / 2;
        const yBoxTop: number = node.y - (node.height + boxStroke) / 2;
        const yBoxBottom: number = node.y + (node.height + boxStroke) / 2;

        const yCoordinateOfIntersectionPointXLeft: number =
            this._gradient * xBoxLeft + this._yAxisPoint;
        const yCoordinateOfIntersectionPointXRight: number =
            this._gradient * xBoxRight + this._yAxisPoint;
        const xCoordinateOfIntersectionPointYTop: number =
            (yBoxTop - this._yAxisPoint) / this._gradient;
        const xCoordinateOfIntersectionPointYBottom: number =
            (yBoxBottom - this._yAxisPoint) / this._gradient;

        return (
            !node.isNodeOutsideOfBox(
                new DummyNode(
                    '',
                    xBoxLeft,
                    yCoordinateOfIntersectionPointXLeft,
                ),
            ) ||
            !node.isNodeOutsideOfBox(
                new DummyNode(
                    '',
                    xBoxRight,
                    yCoordinateOfIntersectionPointXRight,
                ),
            ) ||
            !node.isNodeOutsideOfBox(
                new DummyNode('', yBoxTop, xCoordinateOfIntersectionPointYTop),
            ) ||
            !node.isNodeOutsideOfBox(
                new DummyNode(
                    '',
                    yBoxBottom,
                    xCoordinateOfIntersectionPointYBottom,
                ),
            )
        );
    }

    // distanceToBox(node: BoxNode): number {

    // }

    asJson(): EdgeJson {
        return {
            source: this._source.asJson(),
            target: this._target.asJson(),
        };
    }
}

export interface DfgStackElement {
    activity: Activity;
    source_x: number;
    source_y: number;
}

export interface PetriNetStackElement {
    node: Place | PetriNetTransition;
    source_x: number;
    source_y: number;
    additionalXOffset: number;
}
