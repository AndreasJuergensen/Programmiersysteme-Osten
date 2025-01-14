import { PetriNetArcs } from '../../petrinet/petri-net-arcs';
import { AsStringArrayExportable } from './AsStringArrayExportable';

export class ToPnExportableArcs implements AsStringArrayExportable {
    constructor(private readonly arcs: PetriNetArcs) {}

    asStringArray(): string[] {
        return ['.arcs\n'].concat(
            this.arcs.arcs.map((arc) => arc.start.id + ' ' + arc.end.id + '\n'),
        );
    }
}
