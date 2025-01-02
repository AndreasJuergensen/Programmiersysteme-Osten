import {
    Node as GraphNode,
    ActivityNode,
    BoxNode,
    PlaceNode,
    TransitionNode,
} from 'src/app/classes/graph';

export abstract class Node {
    constructor(private readonly _node: GraphNode) {}

    get id(): string {
        return this._node.id;
    }

    get x(): number {
        return this._node.x;
    }

    get y(): number {
        return this._node.y;
    }
}

export class Place extends Node {
    constructor(node: PlaceNode) {
        super(node);
    }
}

export class Activity extends Node {
    constructor(node: ActivityNode) {
        super(node);
    }
}

export class Transition extends Node {
    private readonly _name: string;

    constructor(node: TransitionNode) {
        super(node);

        this._name = node.name;
    }

    get name(): string {
        return this._name;
    }
}

export class Box extends Node {
    private readonly _width: number;
    private readonly _height: number;
    private readonly _eventLog: string;

    constructor(node: BoxNode) {
        super(node);

        this._width = node.width;
        this._height = node.height;
        this._eventLog = node.eventLog
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
}
