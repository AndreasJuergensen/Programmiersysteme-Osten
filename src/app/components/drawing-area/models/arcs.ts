import { environment } from 'src/environments/environment';
import { Activity, Box, Place, Transition } from './nodes';

export abstract class Arc {
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
        readonly start: Box | Activity | Place | Transition,
        readonly end: Box | Activity | Place | Transition,
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

export class DfgArc extends Arc {
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
        const distanceToRoundedCorner: number = 19;
        const alphaDegAbs = Math.abs(this.alphaDeg);
        let calculatedLength: number;
        switch (alphaDegAbs) {
            case 0:
                calculatedLength = widthHalf + strokeHalf;
                break;
            case 45:
                calculatedLength = Math.sqrt(
                    Math.pow(widthHalf + strokeHalf, 2) +
                        Math.pow(heightHalf + strokeHalf, 2),
                );
                break;
            case 90:
                calculatedLength = heightHalf + strokeHalf;
                break;
            default:
                alphaDegAbs < 45
                    ? (calculatedLength =
                          (widthHalf + strokeHalf) /
                          Math.cos(Math.abs(this.alphaRad)))
                    : (calculatedLength =
                          (heightHalf + strokeHalf) /
                          Math.sin(Math.abs(this.alphaRad)));
                break;
        }
        return calculatedLength < distanceToRoundedCorner
            ? calculatedLength
            : distanceToRoundedCorner;
    }
}

export class PlaceToBoxArc extends Arc {
    constructor(start: Place, end: Box) {
        super(start, end);
        this.calculateCoordinates();
    }

    override calculateCoordinates(): void {
        const x1 = this.start.x;
        const y1 = this.start.y;

        const offsetArrow = 5;
        const widthHalf = (this.end as Box).width / 2;
        const heightHalf = (this.end as Box).height / 2;
        const strokeHalf = environment.drawingElements.boxes.strokeWidth / 2;

        const angleDiagonalRad = Math.atan(
            (heightHalf + strokeHalf) / (widthHalf + strokeHalf),
        );
        const angleDiagonalDeg = (angleDiagonalRad / Math.PI) * 180;

        let lengthToBorder = this.calculateLengthToBoxBorder(
            widthHalf,
            heightHalf,
            strokeHalf,
            angleDiagonalDeg,
        );

        const realLength = this.length - lengthToBorder - offsetArrow;
        const deltaX = realLength * Math.cos(Math.abs(this.alphaRad));
        const deltaY = realLength * Math.sin(Math.abs(this.alphaRad));

        this.x1 = x1;
        this.x2 = x1 + this.sgnX * deltaX;
        this.y1 = y1;
        this.y2 = y1 + this.sgnY * deltaY;
    }

    private calculateLengthToBoxBorder(
        widthHalf: number,
        heightHalf: number,
        strokeHalf: number,
        angleDiagonalDeg: number,
    ): number {
        const alphaDegAbs = Math.abs(this.alphaDeg);
        switch (alphaDegAbs) {
            case 0:
                return widthHalf + strokeHalf;
            case angleDiagonalDeg:
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

        return alphaDegAbs < angleDiagonalDeg
            ? (widthHalf + strokeHalf) / Math.cos(Math.abs(this.alphaRad))
            : (heightHalf + strokeHalf) / Math.sin(Math.abs(this.alphaRad));
    }
}

export class BoxToPlaceArc extends Arc {
    constructor(start: Box, end: Place) {
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

export class PlaceToTransitionArc extends Arc {
    constructor(start: Place, end: Transition) {
        super(start, end);
        this.calculateCoordinates();
    }

    override calculateCoordinates(): void {
        const x1 = this.start.x;
        const y1 = this.start.y;

        const offsetArrow = 5;
        const widthHalf = environment.drawingElements.transitions.width / 2;
        const heightHalf = environment.drawingElements.transitions.height / 2;
        const strokeHalf =
            environment.drawingElements.transitions.strokeWidth / 2;

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

export class PlaceToInvisibleTransitionArc extends Arc {
    constructor(start: Place, end: Transition) {
        super(start, end);
        this.calculateCoordinates();
    }

    override calculateCoordinates(): void {
        const x1 = this.start.x;
        const y1 = this.start.y;

        const offsetArrow = 5;
        const widthHalf =
            environment.drawingElements.invisibleTransitions.width / 2;
        const heightHalf =
            environment.drawingElements.invisibleTransitions.height / 2;
        const strokeHalf =
            environment.drawingElements.invisibleTransitions.strokeWidth / 2;

        const angleDiagonalRad = Math.atan(
            (heightHalf + strokeHalf) / (widthHalf + strokeHalf),
        );
        const angleDiagonalDeg = (angleDiagonalRad / Math.PI) * 180;

        let lengthToBorder = this.calculateLengthToTransitionBorder(
            widthHalf,
            heightHalf,
            strokeHalf,
            angleDiagonalDeg,
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
        angleDiagonalDeg: number,
    ): number {
        const alphaDegAbs = Math.abs(this.alphaDeg);
        switch (alphaDegAbs) {
            case 0:
                return widthHalf + strokeHalf;
            case angleDiagonalDeg:
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

        return alphaDegAbs < angleDiagonalDeg
            ? (widthHalf + strokeHalf) / Math.cos(Math.abs(this.alphaRad))
            : (heightHalf + strokeHalf) / Math.sin(Math.abs(this.alphaRad));
    }
}

export class TransitionToPlaceArc extends Arc {
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
