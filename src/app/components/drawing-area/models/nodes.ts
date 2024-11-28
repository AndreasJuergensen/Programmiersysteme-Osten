export abstract class Node {
    constructor(
        private readonly _id: string,
        private readonly _x: number,
        private readonly _y: number,
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
}

export class Place extends Node {
    constructor(id: string, x: number, y: number) {
        super(id, x, y);
    }
}

export class Activity extends Node {
    constructor(id: string, x: number, y: number) {
        super(id, x, y);
    }
}

export class Transition extends Node {
    constructor(id: string, x: number, y: number) {
        super(id, x, y);
    }
}
