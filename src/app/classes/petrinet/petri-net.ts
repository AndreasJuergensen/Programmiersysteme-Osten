import { Dfg } from '../dfg/dfg';
import { PetriNetArcs } from './petri-net-arcs';
import { Place, Places } from './places';
import {
    PetriNetTransition,
    PetriNetTransitions,
} from './petri-net-transitions';

export class PetriNet {
    private readonly _places: Places = new Places();
    private readonly _transitions: PetriNetTransitions =
        new PetriNetTransitions();
    private readonly _arcs: PetriNetArcs = new PetriNetArcs();

    constructor(dfg?: Dfg) {
        dfg ? this.initializeOriginDFG(dfg) : undefined;
    }

    private initializeOriginDFG(dfg: Dfg): PetriNet {
        this._places.addInputPlace().addOutputPlace();
        this._transitions.createTransition('play').createTransition('stop');

        this._arcs
            .addPlaceToTransitionArc(
                this._places.input,
                this._transitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                this._transitions.getTransitionByID('t1'),
                this._places.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                this._places.getLastPlace(),
                this._transitions.addDFG(dfg).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                this._transitions.getLastTransition(),
                this._places.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                this._places.getLastPlace(),
                this._transitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                this._transitions.getTransitionByID('t2'),
                this._places.output,
            );

        return this;
    }

    updateByExclusiveCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition: PetriNetTransition =
            this.replaceOriginBySub(originDFG, subDFG1);
        const secondReplacingTransition: PetriNetTransition = this._transitions
            .addDFG(subDFG2)
            .getLastTransition();
        this._arcs
            .addPlaceToTransitionArc(
                this._arcs.getPrevPlace(firstReplacingTransition),
                secondReplacingTransition,
            )
            .addTransitionToPlaceArc(
                secondReplacingTransition,
                this._arcs.getNextPlace(firstReplacingTransition),
            );
        return this;
    }

    updateBySequenceCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition: PetriNetTransition = this._transitions
            .addDFG(subDFG1)
            .getLastTransition();
        this._arcs
            .redirectArcEnd(originDFG, firstReplacingTransition)
            .addTransitionToPlaceArc(
                firstReplacingTransition,
                this._places.addPlace().getLastPlace(),
            );
        const secondReplacingTransition: PetriNetTransition = this._transitions
            .addDFG(subDFG2)
            .getLastTransition();
        this._arcs
            .addPlaceToTransitionArc(
                this._arcs.getNextPlace(firstReplacingTransition),
                secondReplacingTransition,
            )
            .redirectArcStart(originDFG, secondReplacingTransition);
        this._transitions.deleteDFG(originDFG);
        return this;
    }

    updateByParallelCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition = this.replaceOriginBySub(
            originDFG,
            subDFG1,
        );
        this._arcs.addTransitionToPlaceArc(
            this._arcs.getPrevTransition(
                this._arcs.getPrevPlace(firstReplacingTransition),
            ),
            this._places.addPlace().getLastPlace(),
        );
        const secondReplacingTransition: PetriNetTransition = this._transitions
            .addDFG(subDFG2)
            .getLastTransition();
        this._arcs
            .addPlaceToTransitionArc(
                this._places.getLastPlace(),
                secondReplacingTransition,
            )
            .addTransitionToPlaceArc(
                secondReplacingTransition,
                this._places.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                this._places.getLastPlace(),
                this._arcs.getNextTransition(
                    this._arcs.getNextPlace(firstReplacingTransition),
                ),
            );
        return this;
    }

    updateByLoopCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition: PetriNetTransition =
            this.replaceOriginBySub(originDFG, subDFG1);
        const secondReplacingTransition: PetriNetTransition = this._transitions
            .addDFG(subDFG2)
            .getLastTransition();
        this._arcs
            .addPlaceToTransitionArc(
                this._arcs.getNextPlace(firstReplacingTransition),
                secondReplacingTransition,
            )
            .addTransitionToPlaceArc(
                secondReplacingTransition,
                this._arcs.getPrevPlace(firstReplacingTransition),
            );
        return this;
    }

    private replaceOriginBySub(originDFG: Dfg, sub: Dfg): PetriNetTransition {
        const replacingTransition: PetriNetTransition = this._transitions
            .addDFG(sub)
            .getLastTransition();
        this._arcs
            .redirectArcEnd(originDFG, replacingTransition)
            .redirectArcStart(originDFG, replacingTransition);
        this._transitions.deleteDFG(originDFG);
        return replacingTransition;
    }

    isBasicPetriNet(): boolean {
        return this.transitions.eachTransitionIsBaseCase();
    }

    get inputPlace(): Place {
        return this._places.input;
    }

    get outputPlace(): Place {
        return this._places.output;
    }

    get places(): Places {
        return this._places;
    }

    get transitions(): PetriNetTransitions {
        return this._transitions;
    }

    get arcs(): PetriNetArcs {
        return this._arcs;
    }
}
