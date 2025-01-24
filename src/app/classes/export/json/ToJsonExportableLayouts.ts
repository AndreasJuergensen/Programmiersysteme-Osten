import { PetriNetTransitions } from '../../petrinet/petri-net-transitions';
import { Places } from '../../petrinet/places';

export class ToJsonExportableLayouts {
    constructor(
        private readonly places: Places,
        private readonly transitions: PetriNetTransitions,
    ) {}

    asJson(): {} {
        return this.places.places
            .concat(this.transitions.transitions)
            .map((layout, i) => {return {id: layout.id, i: i}})
            .reduce((r, layout) => {
                return { ...r, [layout.id]: { x: 100 * layout.i, y: 128 } };
            }, {});
    }
}
