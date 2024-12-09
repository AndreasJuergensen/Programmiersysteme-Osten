import { Dfg } from '../dfg/dfg';
import { PetriNetArcs } from './petri-net-arcs';
import { Places } from './places';
import {
    PetriNetTransition,
    PetriNetTransitions,
} from './petri-net-transitions';

export class PetriNet {
    private readonly places: Places = new Places();
    private readonly transitions: PetriNetTransitions =
        new PetriNetTransitions();
    private readonly arcs: PetriNetArcs = new PetriNetArcs();

    constructor(dfg: Dfg) {
        this.transitions.createTransition('play').createTransition('stop');
        this.arcs
            .addPlaceToTransitionArc(
                this.places.addPlace().getLastPlace(),
                this.transitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                this.transitions.getTransitionByID('t1'),
                this.places.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                this.places.getLastPlace(),
                this.transitions.addDFG(dfg).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                this.transitions.getLastTransition(),
                this.places.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                this.places.getLastPlace(),
                this.transitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                this.transitions.getTransitionByID('t2'),
                this.places.addPlace().getLastPlace(),
            );
    }

    updateByExclusiveCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition: PetriNetTransition =
            this.replaceOriginBySub(originDFG, subDFG1);
        const secondReplacingTransition: PetriNetTransition = this.transitions
            .addDFG(subDFG2)
            .getLastTransition();
        this.arcs
            .addPlaceToTransitionArc(
                this.arcs.getPrevPlace(firstReplacingTransition),
                secondReplacingTransition,
            )
            .addTransitionToPlaceArc(
                secondReplacingTransition,
                this.arcs.getNextPlace(firstReplacingTransition),
            );
        return this;
    }

    updateBySequenceCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition: PetriNetTransition = this.transitions
            .addDFG(subDFG1)
            .getLastTransition();
        this.arcs
            .redirectArcEnd(originDFG, firstReplacingTransition)
            .addTransitionToPlaceArc(
                firstReplacingTransition,
                this.places.addPlace().getLastPlace(),
            );
        const secondReplacingTransition: PetriNetTransition = this.transitions
            .addDFG(subDFG2)
            .getLastTransition();
        this.arcs
            .addPlaceToTransitionArc(
                this.arcs.getNextPlace(firstReplacingTransition),
                secondReplacingTransition,
            )
            .redirectArcStart(originDFG, secondReplacingTransition);
        this.transitions.deleteDFG(originDFG);
        return this;
    }

    updateByParallelCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition = this.replaceOriginBySub(
            originDFG,
            subDFG1,
        );
        this.arcs.addTransitionToPlaceArc(
            this.arcs.getPrevTransition(
                this.arcs.getPrevPlace(firstReplacingTransition),
            ),
            this.places.addPlace().getLastPlace(),
        );
        const secondReplacingTransition: PetriNetTransition = this.transitions
            .addDFG(subDFG2)
            .getLastTransition();
        this.arcs
            .addPlaceToTransitionArc(
                this.places.getLastPlace(),
                secondReplacingTransition,
            )
            .addTransitionToPlaceArc(
                secondReplacingTransition,
                this.places.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                this.places.getLastPlace(),
                this.arcs.getNextTransition(
                    this.arcs.getNextPlace(firstReplacingTransition),
                ),
            );
        return this;
    }

    updateByLoopCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition: PetriNetTransition =
            this.replaceOriginBySub(originDFG, subDFG1);
        const secondReplacingTransition: PetriNetTransition = this.transitions
            .addDFG(subDFG2)
            .getLastTransition();
        this.arcs
            .addPlaceToTransitionArc(
                this.arcs.getNextPlace(firstReplacingTransition),
                secondReplacingTransition,
            )
            .addTransitionToPlaceArc(
                secondReplacingTransition,
                this.arcs.getPrevPlace(firstReplacingTransition),
            );
        return this;
    }

    replaceOriginBySub(originDFG: Dfg, sub: Dfg): PetriNetTransition {
        const replacingTransition: PetriNetTransition = this.transitions
            .addDFG(sub)
            .getLastTransition();
        this.arcs
            .redirectArcEnd(originDFG, replacingTransition)
            .redirectArcStart(originDFG, replacingTransition);
        this.transitions.deleteDFG(originDFG);
        return replacingTransition;
    }

    getAllPlaces(): Places {
        return this.places;
    }

    getAllTransitions(): PetriNetTransitions {
        return this.transitions;
    }

    getAllArcs(): PetriNetArcs {
        return this.arcs;
    }
}
