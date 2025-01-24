import { Places } from '../../petrinet/places';
import { AsStringArrayExportable } from './AsStringArrayExportable';

export class ToPnExportablePlaces implements AsStringArrayExportable {
    constructor(private readonly places: Places) {}

    asStringArray(): string[] {
        return ['.places\n'].concat(
            this.places.places.map((place) => place.id + ' 0\n'),
        );
    }
}
