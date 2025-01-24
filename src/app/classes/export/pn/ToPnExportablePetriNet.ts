import { PetriNet } from '../../petrinet/petri-net';
import { AsStringArrayExportable } from './AsStringArrayExportable';
import { ToPnExportableTransitions } from './ToPnExportableTransitions';
import { ToPnExportablePlaces } from './ToPnExportablePlaces';
import { ToPnExportableArcs } from './ToPnExportableArcs';

export class ToPnExportablePetriNet implements AsStringArrayExportable {
    constructor(
        private readonly toPnExportablePetriNetTransitions: ToPnExportableTransitions,
        private readonly toPnExportablePlaces: ToPnExportablePlaces,
        private readonly toPnExportableArcs: ToPnExportableArcs,
    ) {}

    static fromPetriNet(petriNet: PetriNet): ToPnExportablePetriNet {
        return new ToPnExportablePetriNet(
            new ToPnExportableTransitions(petriNet.transitions),
            new ToPnExportablePlaces(petriNet.places),
            new ToPnExportableArcs(petriNet.arcs),
        );
    }

    asStringArray(): string[] {
        return ['.type pn\n'].concat(
            this.toPnExportablePetriNetTransitions.asStringArray(),
            this.toPnExportablePlaces.asStringArray(),
            this.toPnExportableArcs.asStringArray(),
        );
    }
}
