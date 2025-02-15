export interface Place {
    id: string;
}
export class Places {
    private readonly _places: Array<Place> = new Array();
    private idCount: number = 0;

    constructor() {}

    addInputPlace(): Places {
        const placeId: string = 'input';
        const place: Place = { id: placeId };
        this._places.push(place);
        return this;
    }

    addOutputPlace(): Places {
        const placeId: string = 'output';
        const place: Place = { id: placeId };
        this._places.push(place);
        return this;
    }

    addPlace(): Places {
        const placeID: string = 'p' + ++this.idCount;
        const place: Place = { id: placeID };
        this._places.push(place);
        return this;
    }

    removePlace(placeToRemove: Place): Places {
        for (const [index, place] of this._places.entries()) {
            if (place === placeToRemove) {
                this._places.splice(index, 1);
                return this;
            }
        }
        throw new Error('Place not found');
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

    getAllPlaces(): Array<Place> {
        return this._places;
    }

    get input(): Place {
        return this._places[0];
    }

    get output(): Place {
        return this._places[1];
    }

    get places(): Array<Place> {
        return this._places;
    }

    get isEmpty(): boolean {
        return this._places.length === 0;
    }
}
