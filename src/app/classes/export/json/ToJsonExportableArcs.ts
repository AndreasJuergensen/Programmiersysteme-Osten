import { PetriNetArcs } from '../../petrinet/petri-net-arcs';

export class ToJsonExportableArcs {
    constructor(private readonly arcs: PetriNetArcs) {}

    asJson(): {} {
        return this.arcs.arcs
            .map((arc) => arc.start.id + ',' + arc.end.id)
            .reduce((r, arc) => {
                return { ...r, [arc]: 1 };
            }, {});
    }
}
