import { PetriNetTransitions } from '../../petrinet/petri-net-transitions';
import { AsStringArrayExportable } from '../AsStringArrayExportable';

export class ToPnExportableTransitions implements AsStringArrayExportable {
    constructor(private readonly transitions: PetriNetTransitions) {}

    asStringArray(): string[] {
        return ['.transitions\n'].concat(
            this.transitions.transitions.map(
                (transition) => transition.id + ' ' + (transition.name || '') + '\n',
            ),
        );
    }
}
