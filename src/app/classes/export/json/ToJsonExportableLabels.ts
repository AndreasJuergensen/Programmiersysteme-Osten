import { PetriNetTransitions } from '../../petrinet/petri-net-transitions';

export class ToJsonExportableLabels {
    constructor(private readonly transitions: PetriNetTransitions) {}

    asJson(): {} {
        return this.transitions.transitions
            .filter((transition) => transition.name)
            .reduce((r, transition) => {
                return { ...r, [transition.id]: transition.name };
            }, {});
    }
}
