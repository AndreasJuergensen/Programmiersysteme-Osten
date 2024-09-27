import {Injectable} from '@angular/core';
import {Diagram} from '../classes/diagram/diagram';
import {Element} from '../classes/diagram/element';
import {Coords, JsonPetriNet} from "../classes/json-petri-net";

@Injectable({
    providedIn: 'root'
})
export class ParserService {

    constructor() {
    }

    parse(text: string): Diagram | undefined {
        try {
            const rawData = JSON.parse(text) as JsonPetriNet;

            const elements = this.parseElements(rawData['places']);
            this.setPosition(elements, rawData['layout']);

            return new Diagram(elements);
        } catch (e) {
            console.error('Error while parsing JSON', e, text);
            return undefined;
        }
    }

    private parseElements(placeIds: Array<string> | undefined): Array<Element> {
        if (placeIds === undefined || !Array.isArray(placeIds)) {
            return [];
        }

        return placeIds.map(pid => new Element(pid));
    }

    private setPosition(elements: Array<Element>, layout: JsonPetriNet['layout']) {
        if (layout === undefined) {
            return;
        }

        for (const el of elements) {
            const pos = layout[el.id] as Coords | undefined;
            if (pos !== undefined) {
                el.x = pos.x;
                el.y = pos.y;
            }
        }
    }
}
