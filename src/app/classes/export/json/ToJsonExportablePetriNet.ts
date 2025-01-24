import { PetriNet } from "../../petrinet/petri-net";
import { ToJsonExportableArcs } from "./ToJsonExportableArcs";
import { ToJsonExportableLabels } from "./ToJsonExportableLabels";
import { ToJsonExportablePlaces } from "./ToJsonExportablePlaces";
import { ToJsonExportableTransitions } from "./ToJsonExportableTransitions";

export class ToJsonExportablePetriNet {
    constructor(
        private readonly toJsonExportablePlaces: ToJsonExportablePlaces,
        private readonly toJsonExportableTransitions: ToJsonExportableTransitions,
        private readonly toJsonExportableArcs: ToJsonExportableArcs,
        private readonly toJsonExportableLables: ToJsonExportableLabels,
    ) {}

    static fromPetriNet(petriNet: PetriNet): ToJsonExportablePetriNet {
        return new ToJsonExportablePetriNet(
            new ToJsonExportablePlaces(petriNet.places),
            new ToJsonExportableTransitions(petriNet.transitions),
            new ToJsonExportableArcs(petriNet.arcs),
            new ToJsonExportableLabels(petriNet.transitions),
        );
    }

    asJson(): string {
        return JSON.stringify({
            places: this.toJsonExportablePlaces.asJson(),
            transitions: this.toJsonExportableTransitions.asJson(),
            arcs: this.toJsonExportableArcs.asJson(),
            actions: [],
            labels: this.toJsonExportableLables.asJson(),
            marking: {},
            layout: {},
        });
    }
}