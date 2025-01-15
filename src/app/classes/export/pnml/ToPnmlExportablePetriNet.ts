import { XMLBuilder } from 'fast-xml-parser';
import { PetriNet } from '../../petrinet/petri-net';
import { ToPnmlExportableArcs } from './ToPnmlExportableArcs';
import { ToPnmlExportablePlaces } from './ToPnmlExportablePlaces';
import { ToPnmlExportableTransitions } from './ToPnmlExportableTransitions';

export class ToPnmlExportablePetriNet {
    static fromPetriNet(petriNet: PetriNet): ToPnmlExportablePetriNet {
        return new ToPnmlExportablePetriNet(
            new ToPnmlExportableArcs(petriNet.arcs),
            new ToPnmlExportablePlaces(petriNet.places),
            new ToPnmlExportableTransitions(petriNet.transitions),
            new XMLBuilder({
                ignoreAttributes: false,
            }),
        );
    }

    constructor(
        private readonly toPnmlExportableArcs: ToPnmlExportableArcs,
        private readonly toPnmlExportablePlaces: ToPnmlExportablePlaces,
        private readonly toPnmlExportableTransitions: ToPnmlExportableTransitions,
        private readonly xmlBuilder: XMLBuilder,
    ) {}

    asPnml(): string {
        return this.xmlBuilder.build({
            '?xml': {
                '@_version': '1.0',
                '@_encoding': 'UTF-8',
            },
            pnml: {
                net: {
                    '@_id': 'petri-net',
                    '@_type': 'http://www.pnml.org/version-2009/grammar/pnml',
                    arc: this.toPnmlExportableArcs.asPnml(),
                    place: this.toPnmlExportablePlaces.asPnml(),
                    transition: this.toPnmlExportableTransitions.asPnml(),
                },
            },
        });
    }
}
