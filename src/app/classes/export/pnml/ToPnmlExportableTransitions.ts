import { PetriNetTransitions } from "../../petrinet/petri-net-transitions";

export class ToPnmlExportableTransitions {
    constructor(private readonly transitions: PetriNetTransitions) {}

    asPnml() {
        return this.transitions.transitions.map((transition) => ({
            '@_id': transition.id,
            name: {text: transition.name},
        }));
    }
}