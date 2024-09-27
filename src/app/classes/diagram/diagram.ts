import {Element} from './element';

export class Diagram {
    private readonly _elements: Array<Element>;

    constructor(elements: Array<Element>) {
        this._elements = elements;
    }

    get elements(): Array<Element> {
        return this._elements;
    }
}
