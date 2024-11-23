import { environment } from 'src/environments/environment';
import { Activity, Place, Transition } from './nodes';

export abstract class Edge {
    readonly length: number;
    readonly alphaRad: number;
    readonly alphaDeg: number;
    readonly sgnX: number;
    readonly sgnY: number;

    x1: number = 0;
    x2: number = 0;
    y1: number = 0;
    y2: number = 0;

    constructor(
        readonly start: Place | Transition | Activity,
        readonly end: Place | Activity,
    ) {
        const lengthX = this.end.x - this.start.x;
        const lengthY = this.end.y - this.start.y;

        this.length = Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2));
        this.alphaRad = Math.atan(lengthY / lengthX);
        this.alphaDeg = (this.alphaRad / Math.PI) * 180;

        this.sgnX = this.start.x > this.end.x ? -1 : 1;
        this.sgnY = this.start.y > this.end.y ? -1 : 1;
    }

    abstract calculateCoordinates(): void;
}

export class DfgArc extends Edge {
    constructor(start: Activity, end: Activity) {
        super(start, end);
        this.calculateCoordinates();
    }

    override calculateCoordinates(): void {
        const x1 = this.start.x;
        const y1 = this.start.y;

        const offsetArrow = 5;
        const widthHalf = environment.drawingElements.activities.width / 2;
        const heightHalf = environment.drawingElements.activities.height / 2;
        const strokeHalf =
            environment.drawingElements.activities.strokeWidth / 2;

        let lengthToBorder = this.calculateLengthToActivityBorder(
            widthHalf,
            heightHalf,
            strokeHalf,
        );

        const realLength = this.length - lengthToBorder - offsetArrow;
        const deltaX = realLength * Math.cos(Math.abs(this.alphaRad));
        const deltaY = realLength * Math.sin(Math.abs(this.alphaRad));

        this.x1 = x1;
        this.x2 = x1 + this.sgnX * deltaX;
        this.y1 = y1;
        this.y2 = y1 + this.sgnY * deltaY;
    }

    private calculateLengthToActivityBorder(
        widthHalf: number,
        heightHalf: number,
        strokeHalf: number,
    ): number {
        const alphaDegAbs = Math.abs(this.alphaDeg);
        switch (alphaDegAbs) {
            case 0:
                return widthHalf + strokeHalf;
            case 45:
                return Math.sqrt(
                    Math.pow(widthHalf + strokeHalf, 2) +
                        Math.pow(heightHalf + strokeHalf, 2),
                );
            case 90:
                return heightHalf + strokeHalf;

            default:
                break;
        }

        return alphaDegAbs < 45
            ? (widthHalf + strokeHalf) / Math.cos(Math.abs(this.alphaRad))
            : (heightHalf + strokeHalf) / Math.sin(Math.abs(this.alphaRad));
    }
}

export class PlaceToTransitionArc extends Edge {
    constructor(start: Place, end: Transition) {
        super(start, end);
        this.calculateCoordinates();
    }

    override calculateCoordinates(): void {
        const x1 = this.start.x;
        const y1 = this.start.y;

        const offsetArrow = 5;
        const widthHalf = environment.drawingElements.activities.width / 2;
        const heightHalf = environment.drawingElements.activities.height / 2;
        const strokeHalf =
            environment.drawingElements.activities.strokeWidth / 2;

        let lengthToBorder = this.calculateLengthToTransitionBorder(
            widthHalf,
            heightHalf,
            strokeHalf,
        );

        const realLength = this.length - lengthToBorder - offsetArrow;
        const deltaX = realLength * Math.cos(Math.abs(this.alphaRad));
        const deltaY = realLength * Math.sin(Math.abs(this.alphaRad));

        this.x1 = x1;
        this.x2 = x1 + this.sgnX * deltaX;
        this.y1 = y1;
        this.y2 = y1 + this.sgnY * deltaY;
    }

    private calculateLengthToTransitionBorder(
        widthHalf: number,
        heightHalf: number,
        strokeHalf: number,
    ): number {
        const alphaDegAbs = Math.abs(this.alphaDeg);
        switch (alphaDegAbs) {
            case 0:
                return widthHalf + strokeHalf;
            case 45:
                return Math.sqrt(
                    Math.pow(widthHalf + strokeHalf, 2) +
                        Math.pow(heightHalf + strokeHalf, 2),
                );
            case 90:
                return heightHalf + strokeHalf;

            default:
                break;
        }

        return alphaDegAbs < 45
            ? (widthHalf + strokeHalf) / Math.cos(Math.abs(this.alphaRad))
            : (heightHalf + strokeHalf) / Math.sin(Math.abs(this.alphaRad));
    }
}

export class TransitionToPlaceArc extends Edge {
    constructor(start: Transition, end: Place) {
        super(start, end);
        this.calculateCoordinates();
    }

    override calculateCoordinates(): void {
        const x1 = this.start.x;
        const y1 = this.start.y;

        const offsetArrow = 5;
        const radius = environment.drawingElements.places.radius;
        const strokeHalf = environment.drawingElements.places.strokeWidth / 2;

        const lengthToBorder = radius + strokeHalf;
        const realLength = this.length - lengthToBorder - offsetArrow;

        const deltaX = realLength * Math.cos(Math.abs(this.alphaRad));
        const deltaY = realLength * Math.sin(Math.abs(this.alphaRad));

        this.x1 = x1;
        this.x2 = x1 + this.sgnX * deltaX;
        this.y1 = y1;
        this.y2 = y1 + this.sgnY * deltaY;
    }
}
