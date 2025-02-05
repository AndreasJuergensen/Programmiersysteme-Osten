import { Dfg } from '../dfg/dfg';
import { PetriNetArcs } from './petri-net-arcs';
import { Place, Places } from './places';
import {
    PetriNetTransition,
    PetriNetTransitions,
} from './petri-net-transitions';
import { Activities } from '../dfg/activities';

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
        this._arcs
            .addPlaceToTransitionArc(
                this._places.input,
                this._transitions.addDFG(dfg).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                this._transitions.getLastTransition(),
                this._places.output,
            );
        return this;
    }

    updateByExclusiveCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition: PetriNetTransition =
            this.replaceOriginByDefinedBlock(originDFG, subDFG1);
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
        this.addInvisibleTransitionFor(subDFG1, firstReplacingTransition);
        this.addInvisibleTransitionFor(subDFG2, secondReplacingTransition);
        this._transitions.removeDFG(originDFG);
        return this;
    }

    addInvisibleTransitionFor(dfg: Dfg, transition: PetriNetTransition): void {
        if (dfg.eventLog.hasOptionalSequence) {
            const invisibleBypassTransition: PetriNetTransition =
                this.transitions.createTransition('').getLastTransition();
            this.arcs
                .addPlaceToTransitionArc(
                    this.arcs.getPrevPlace(transition),
                    invisibleBypassTransition,
                )
                .addTransitionToPlaceArc(
                    invisibleBypassTransition,
                    this.arcs.getNextPlace(transition),
                );
        }
    }

    updateByParallelCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition = this.replaceOriginByDefinedBlock(
            originDFG,
            subDFG1,
        );
        if (
            this.previousEventLogContainsTraceIncludingOnlyActivitiesFromPartition(
                subDFG1.activities,
                originDFG,
            )
        ) {
            this._arcs
                .addPlaceToTransitionArc(
                    this.arcs.getPrevPlace(firstReplacingTransition),
                    this._transitions.createTransition('').getLastTransition(),
                )
                .addTransitionToPlaceArc(
                    this._transitions.getLastTransition(),
                    this._arcs.getNextPlace(firstReplacingTransition),
                );
        }
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
        if (
            this.previousEventLogContainsTraceIncludingOnlyActivitiesFromPartition(
                subDFG2.activities,
                originDFG,
            )
        ) {
            this._arcs
                .addPlaceToTransitionArc(
                    this._arcs.getPrevPlace(secondReplacingTransition),
                    this._transitions.createTransition('').getLastTransition(),
                )
                .addTransitionToPlaceArc(
                    this._transitions.getLastTransition(),
                    this._arcs.getNextPlace(secondReplacingTransition),
                );
        }
        return this;
    }

    previousEventLogContainsTraceIncludingOnlyActivitiesFromPartition(
        partition: Activities,
        dfg: Dfg,
    ) {
        for (const trace of dfg.eventLog.getAllTraces()) {
            let containsActivity: boolean = false;
            for (const activity of trace.activities) {
                if (partition.containsActivity(activity)) {
                    containsActivity = true;
                    break;
                }
            }
            if (!containsActivity) {
                return true;
            }
        }
        return false;
    }

    updateByLoopCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): PetriNet {
        const firstReplacingTransition: PetriNetTransition =
            this.replaceOriginByDefinedBlock(originDFG, subDFG1);
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

    private replaceOriginByDefinedBlock(
        originDFG: Dfg,
        sub: Dfg,
    ): PetriNetTransition {
        const blockStartTransition: PetriNetTransition = this._transitions
            .createTransition('')
            .getLastTransition();
        const replacingTransition: PetriNetTransition = this._transitions
            .addDFG(sub)
            .getLastTransition();
        const blockStopTransition: PetriNetTransition = this._transitions
            .createTransition('')
            .getLastTransition();
        this._arcs
            .redirectArcEnd(originDFG, blockStartTransition)
            .redirectArcStart(originDFG, blockStopTransition)
            .addTransitionToPlaceArc(
                blockStartTransition,
                this._places.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                this._places.getLastPlace(),
                replacingTransition,
            )
            .addTransitionToPlaceArc(
                replacingTransition,
                this._places.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                this._places.getLastPlace(),
                blockStopTransition,
            );
        this._transitions.removeDFG(originDFG);
        return replacingTransition;
    }

    isEmpty() {
        return this.transitions.transitions.length === 0;
    }

    updateByFlowerFallThrough(originDFG: Dfg, flowerDFGs: Dfg[]): PetriNet {
        const flowerCentre: Place = this.replaceOriginByFlowerCentre(originDFG);
        for (const dfg of flowerDFGs) {
            this.insertFlowerDFG(dfg, flowerCentre);
        }
        return this;
    }

    private replaceOriginByFlowerCentre(originDFG: Dfg): Place {
        const flowerCentre: Place = this._places.addPlace().getLastPlace();
        const blockStartTransition: PetriNetTransition = this._transitions
            .createTransition('')
            .getLastTransition();
        const blockStopTransition: PetriNetTransition = this._transitions
            .createTransition('')
            .getLastTransition();
        this._arcs
            .redirectArcEnd(originDFG, blockStartTransition)
            .redirectArcStart(originDFG, blockStopTransition);
        this._arcs
            .addTransitionToPlaceArc(blockStartTransition, flowerCentre)
            .addPlaceToTransitionArc(flowerCentre, blockStopTransition);
        this._transitions.removeDFG(originDFG);
        return flowerCentre;
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

    public getDFGs(): Array<Dfg> {
        return this._transitions.getAllDFGs();
    }
}
