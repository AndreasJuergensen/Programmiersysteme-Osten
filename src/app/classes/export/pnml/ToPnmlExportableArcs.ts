import { PetriNetArcs } from "../../petrinet/petri-net-arcs";

export class ToPnmlExportableArcs {
    constructor(private readonly arcs: PetriNetArcs) {}

    asPnml(): any[] {
        return this.arcs.arcs.map((arc) => ({
            '@_id': arc.start.id + "," + arc.end.id,
            '@_source': arc.start.id,
            '@_target': arc.end.id,
        }));
    }
}