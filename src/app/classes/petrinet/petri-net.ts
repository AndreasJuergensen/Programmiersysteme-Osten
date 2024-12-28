import { Dfg } from '../dfg/dfg';
import { PetriNetArcs } from './petri-net-arcs';
import { Place, Places } from './places';
import {
    PetriNetTransition,
    PetriNetTransitions,
} from './petri-net-transitions';
import { EventLog } from '../event-log';

export class PetriNet {
    private readonly _places: Places = new Places();
    private readonly _transitions: PetriNetTransitions =
        new PetriNetTransitions();
    private readonly _arcs: PetriNetArcs = new PetriNetArcs();
    // private _isInitialized: boolean = false;

    constructor(dfg?: Dfg) {
        dfg ? this.initializeOriginDFG(dfg) : undefined;
    }

    private initializeOriginDFG(dfg: Dfg): PetriNet {
        // this._isInitialized = true;
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
        this._transitions.removeDFG(originDFG);
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
        this._transitions.removeDFG(originDFG);
        return replacingTransition;
    }

    isBasicPetriNet(): boolean {
        return this.transitions.eachTransitionIsBaseCase();
    }

    updateByFlowerFallThrough(originDFG: Dfg, flowerDFGs: Dfg[]): PetriNet {
        const flowerCentre: Place = this.replaceOriginByFlowerCentre(originDFG);
        for (const dfg of flowerDFGs) {
            this.insertFlowerDFG(dfg, flowerCentre);
        }
        return this;
    }

    private insertFlowerDFG(dfg: Dfg, centre: Place): PetriNet {
        this.transitions.addDFG(dfg);
        this.arcs
            .addPlaceToTransitionArc(
                centre,
                this.transitions.getLastTransition(),
            )
            .addTransitionToPlaceArc(
                this.transitions.getLastTransition(),
                centre,
            );
        return this;
    }

    private replaceOriginByFlowerCentre(origin: Dfg): Place {
        const flowerCentre: Place = this.arcs.getPrevPlace(origin);
        this.arcs.redirectArcEnd(
            origin,
            this.arcs.getNextTransition(this.arcs.getNextPlace(origin)),
        );
        this.arcs.removeArc(
            this.arcs.getNextPlace(origin),
            this.arcs.getNextTransition(flowerCentre),
        );
        this.places.removePlace(this.arcs.getNextPlace(origin));
        this.arcs.removeArc(origin, this.arcs.getNextPlace(origin));
        this.transitions.removeDFG(origin);
        return flowerCentre;
    }

    cutCanBeExecuted(): boolean {
        const petriNetDFGs: Dfg[] = this.getDFGs();
        for (const dfg of petriNetDFGs) {
            if (dfg.canBeCutByAnyPartitions()) {
                return true;
            }
        }
        return false;
    }

    acitivityOncePerTraceIsFeasible(): boolean {
        const petriNetDFGs: Dfg[] = this.getDFGs();
        for (const dfg of petriNetDFGs) {
            const eventLog: EventLog = dfg.eventLog;
            for (const activity of dfg.activities.getAllActivites()) {
                if (eventLog.activityOncePerTraceIsPossibleBy(activity)) {
                    return true;
                }
            }
        }
        return false;
    }

    getDFGs(): Dfg[] {
        return this._transitions.getAllDFGs();
    }

    // get isInitialized(): boolean {
    //     return this._isInitialized;
    // }

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
