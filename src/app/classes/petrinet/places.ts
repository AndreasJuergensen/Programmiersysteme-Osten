export class Places {
    private readonly places: Array<Place> = new Array();
    private idCount: number = 0;
    constructor() {}

    addPlace(): Places {
        const placeID: string = 'p' + ++this.idCount;
        const place: Place = { id: placeID };
        this.places.push(place);
        return this;
    }

    getLastPlace(): Place {
        return this.places[this.places.length - 1];
    }

    getPlaceByID(placeID: string): Place {
        for (const place of this.places) {
            if (place.id === placeID) {
                return place;
            }
        }
        throw new Error('Place not found');
    }
}

export interface Place {
    id: string;
}
