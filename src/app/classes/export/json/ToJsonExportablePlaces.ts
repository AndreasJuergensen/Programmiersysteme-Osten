import { Places } from "../../petrinet/places";

export class ToJsonExportablePlaces {
    constructor(private readonly places: Places) {}

    asJson(): string[] {
        return this.places.places.map((place) => place.id)
    }
}