import { Dfg } from '../dfg/dfg';
import { PetriNetArcs } from './petri-net-arcs';
import { Places } from './places';
import { PetriNetTransition, Transitions } from './transitions';

export class PetriNet {
    private readonly places: Places = new Places();
    private readonly transitions: Transitions = new Transitions();
    private readonly arcs: PetriNetArcs = new PetriNetArcs();

    constructor(dfg: Dfg) {
        this.arcs
            .addPlaceToTransitionArc(
                this.places.addPlace(),
                this.transitions
                    .createPetrinetTransition('play')
                    .getLastTransition(),
            )
            .addTransitionToPlaceArc(
                this.transitions.getLastTransition(),
                this.places.addPlace(),
            )
            .addPlaceToTransitionArc(this.places.getLastPlace(), dfg)
            .addTransitionToPlaceArc(dfg, this.places.addPlace())
            .addPlaceToTransitionArc(
                this.places.getLastPlace(),
                this.transitions
                    .createPetrinetTransition('stop')
                    .getLastTransition(),
            )
            .addTransitionToPlaceArc(
                this.transitions.getLastTransition(),
                this.places.addPlace(),
            );
    }

    updateByExclusiveCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstImportedTransition: PetriNetTransition =
            this.replaceOriginBySub(originDFG, subDFG1);
        const secondImportedTransition: PetriNetTransition = this.transitions
            .addTransition(subDFG2)
            .getLastTransition();
        this.arcs
            .addPlaceToTransitionArc(
                this.arcs.getPrevPlace(firstImportedTransition),
                secondImportedTransition,
            )
            .addTransitionToPlaceArc(
                secondImportedTransition,
                this.arcs.getNextPlace(firstImportedTransition),
            );
        return this;
    }

    updateBySequenceCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstImportedTransition: PetriNetTransition = this.transitions
            .addTransition(subDFG1)
            .getLastTransition();
        this.arcs
            .redirectArcEnd(originDFG, firstImportedTransition)
            .addTransitionToPlaceArc(
                firstImportedTransition,
                this.places.addPlace(),
            );
        const secondImportedTransition: PetriNetTransition = this.transitions
            .addTransition(subDFG2)
            .getLastTransition();
        this.arcs
            .addPlaceToTransitionArc(
                this.arcs.getNextPlace(firstImportedTransition),
                secondImportedTransition,
            )
            .redirectArcStart(originDFG, secondImportedTransition);
        this.transitions.deleteTransition(originDFG);
        return this;
    }

    // parallel cut needs new places for parallelism
    updateByParallelCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        // replace origin dfg by first sub dfg using exisisting elements
        const firstImportedTransition = this.replaceOriginBySub(
            originDFG,
            subDFG1,
        );
        // import second sub dfg and connect with with new reaching elements
        this.arcs.addTransitionToPlaceArc(
            this.arcs.getPrevTransition(
                this.arcs.getPrevPlace(firstImportedTransition),
            ),
            this.places.addPlace(),
        );
        const secondImportedTransition: PetriNetTransition = this.transitions
            .addTransition(subDFG2)
            .getLastTransition();
        this.arcs
            .addPlaceToTransitionArc(
                this.places.getLastPlace(),
                secondImportedTransition,
            )
            // connect second sub dfg to new reachable elements
            .addTransitionToPlaceArc(
                secondImportedTransition,
                this.places.addPlace(),
            )
            .addPlaceToTransitionArc(
                this.places.getLastPlace(),
                this.arcs.getNextTransition(
                    this.arcs.getNextPlace(firstImportedTransition),
                ),
            );
        return this;
    }

    updateByLoopCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstImportedTransition: PetriNetTransition =
            this.replaceOriginBySub(originDFG, subDFG1);
        const secondImportedTransition: PetriNetTransition = this.transitions
            .addTransition(subDFG2)
            .getLastTransition();
        this.arcs
            .addPlaceToTransitionArc(
                this.arcs.getNextPlace(firstImportedTransition),
                secondImportedTransition,
            )
            .addTransitionToPlaceArc(
                secondImportedTransition,
                this.arcs.getPrevPlace(firstImportedTransition),
            );
        return this;
    }

    replaceOriginBySub(originDFG: Dfg, sub: Dfg): PetriNetTransition {
        const transition: PetriNetTransition = this.transitions
            .addTransition(sub)
            .getLastTransition();
        this.arcs
            .redirectArcEnd(originDFG, transition)
            .redirectArcStart(originDFG, transition);
        this.transitions.deleteTransition(originDFG);
        return transition;
    }

    /**
     * SCRUM-19: Ende anzeigen
     */
    isBasicPetriNet(): boolean {
        return this.transitions.allTransitionsAreBaseCases();
    }
}
