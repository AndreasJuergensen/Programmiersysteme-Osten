import { environment } from 'src/environments/environment';
import { Activity, Place, Transition } from './nodes';

export abstract class Edge {
    x1: number = 0;
    x2: number = 0;
    y1: number = 0;
    y2: number = 0;

    constructor(
        readonly start: Place | Transition | Activity,
        readonly end: Place | Activity,
    ) {}

    abstract calculateCoordinates(): void;
}

export class PlaceToTransitionArc extends Edge {
    constructor(start: Place, end: Transition) {
        super(start, end);
        this.calculateCoordinates();
    }

    override calculateCoordinates(): void {
        const width: number = environment.drawingElements.transitions.width;

        const refX: number = 5;

        const lengthY = this.end.coordinates.y - this.start.coordinates.y;
        const lengthX = this.end.coordinates.x - this.start.coordinates.x;
        const alpha = Math.atan(lengthY / lengthX);

        const x2_: number = this.end.coordinates.x - width / 2;
        const y2_: number = (width / 2) * Math.tan(-1 * alpha);
        this.x1 = this.start.coordinates.x;
        this.y1 = this.start.coordinates.y;
        this.x2 = x2_ - refX;
        this.y2 = this.end.coordinates.y + y2_;
    }
}

export class TransitionToPlaceArc extends Edge {
    constructor(start: Transition, end: Place) {
        super(start, end);
        this.calculateCoordinates();
    }

    override calculateCoordinates(): void {
        const radius: number = environment.drawingElements.places.radius;

        const lengthY = this.end.coordinates.y - this.start.coordinates.y;
        const lengthX = this.end.coordinates.x - this.start.coordinates.x;
        const alpha = Math.atan(lengthY / lengthX);

        // const x2_: number = this.end.coordinates.x - radius - 5;
        // const y2_: number = radius * Math.tan(-1 * alpha);

        const x_2: number = radius * Math.sin(alpha);
        const y_2: number = radius * Math.cos(alpha);

        this.x1 = this.start.coordinates.x;
        this.y1 = this.start.coordinates.y;
        // this.x2 = x2_;
        this.x2 += x_2;
        // this.y2 = this.end.coordinates.y + y2_;
        this.y2 += y_2;
    }
}

export class DfgArc extends Edge {
    constructor(start: Activity, end: Activity) {
        super(start, end);
        this.calculateCoordinates();
    }

    override calculateCoordinates(): void {
        const width: number = environment.drawingElements.activities.width;

        const refX: number = 5;

        const lengthY = this.end.coordinates.y - this.start.coordinates.y;
        const lengthX = this.end.coordinates.x - this.start.coordinates.x;
        const alpha = Math.atan(lengthY / lengthX);

        const x2_: number = this.end.coordinates.x - width / 2;
        const y2_: number = (width / 2) * Math.tan(-1 * alpha);

        this.x1 = this.start.coordinates.x;
        this.y1 = this.start.coordinates.y;
        this.x2 = x2_ - refX;
        this.y2 = this.end.coordinates.y + y2_;
    }
}
