export interface Place {
    id: string;
}
export class Places {
    private readonly _places: Array<Place> = new Array();
    private idCount: number = 0;

    constructor() {}

    addPlace(): Places {
        const placeID: string = 'p' + ++this.idCount;
        const place: Place = { id: placeID };
        this._places.push(place);
        return this;
    }

    getInput(): Place {
        return this._places[0];
    }

    getOutput(): Place {
        return this._places[3];
    }

    getLastPlace(): Place {
        return this._places[this._places.length - 1];
    }

    getPlaceByID(placeID: string): Place {
        for (const place of this._places) {
            if (place.id === placeID) {
                return place;
            }
        }
        throw new Error('Place not found');
    }
}
