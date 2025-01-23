import { PetriNetTransitions } from '../../petrinet/petri-net-transitions';

export class ToJsonExportableTransitions {
    constructor(private readonly transitions: PetriNetTransitions) {}

    asJson(): string[] {
        return this.transitions.transitions.map((transition) => transition.id);
    }
}
