export class Element {
    private readonly _id: string;
    private _x: number;
    private _y: number;
    private _svgElement: SVGElement | undefined;

    constructor(id: string, x: number = 0, y: number = 0) {
        this._id = id;
        this._x = x;
        this._y = y;
    }

    get id(): string {
        return this._id;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    public registerSvg(svg: SVGElement) {
        this._svgElement = svg;
    }
}
