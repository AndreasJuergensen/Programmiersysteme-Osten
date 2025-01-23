import { Places } from "../../petrinet/places";

export class ToPnmlExportablePlaces {
    constructor(private readonly places: Places) {}

    asPnml() {
        return this.places.places.map((place) => ({
            '@_id': place.id,
        }));
    }
}