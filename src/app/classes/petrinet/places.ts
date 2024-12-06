export class Places {
    private idCount: number = 0;
    constructor(private readonly places: Array<Place> = new Array()) {}

    addPlace(): Place {
        const placeID: string = 'p' + ++this.idCount;
        const place: Place = { id: placeID };
        this.places.push(place);
        return place;
    }

    getLastPlace(): Place {
        return this.places[this.places.length - 1];
    }
}

export interface Place {
    id: string;
}
