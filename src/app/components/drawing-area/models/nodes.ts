export class Coordinates {
    constructor(
        readonly x: number,
        readonly y: number,
    ) {}
}

export abstract class Node {
    constructor(
        readonly id: string,
        readonly coordinates: Coordinates,
    ) {}
}

export class Place extends Node {
    constructor(id: string, coordinates: Coordinates) {
        super(id, coordinates);
    }
}

export class Activity extends Node {
    constructor(id: string, coordinates: Coordinates) {
        super(id, coordinates);
    }
}

export class Transition extends Node {
    constructor(id: string, coordinates: Coordinates) {
        super(id, coordinates);
    }
}
