import { Injectable } from '@angular/core';
import { Arcs, DfgArc } from '../classes/dfg/arcs';
import {
    PetriNetArcs,
    PlaceToTransitionArc,
    TransitionToPlaceArc,
} from '../classes/petrinet/petri-net-arcs';
import { PetriNet } from '../classes/petrinet/petri-net';
import { Dfg, DfgBuilder } from '../classes/dfg/dfg';
import { Subscription } from 'rxjs';
import { Arc } from '../components/drawing-area/models';
import { PetriNetManagementService } from './petri-net-management.service';

@Injectable({
    providedIn: 'root',
})
export class CollectArcsService {
    private petriNet!: PetriNet;
    private _collectedArcs: Arcs = new Arcs();
    private _acutalDFG: Dfg | undefined;

    constructor(private petriNetManagementService: PetriNetManagementService) {
        this.petriNetManagementService.petriNet$.subscribe((petriNetSub) => {
            this.petriNet = petriNetSub;
        });
    }

    get collectedArcs(): Arcs {
        return this._collectedArcs;
    }

    private getDFGArcsFromPetriNet(): Array<DfgArc> {
        const dfgArcs = new Array<DfgArc>();
        const dfgs = this.petriNet.transitions.getAllDFGs();

        for (const dfg of dfgs) {
            for (const dfgarc of dfg.arcs.getArcs()) {
                dfgArcs.push(dfgarc);
            }
        }
        return dfgArcs;
    }

    public isDFGArc(arc: Arc): boolean {
        const dfgArcToCheck = this.getDFGArc(arc);
        if (dfgArcToCheck === undefined) {
            return false;
        }

        return true;
    }

    public isArcinSameDFG(arc: Arc): boolean {
        const dfgArcToCheck = this.getDFGArc(arc);
        if (this._acutalDFG !== undefined) {
            const arcInDFG: DfgArc | undefined =
                this._acutalDFG.arcs.getArcByStartNameAndEndName(
                    arc.start.id,
                    arc.end.id,
                );

            if (arcInDFG !== undefined) {
                return false;
            }
        }

        return true;
    }

    private getDFGArc(arc: Arc): DfgArc | undefined {
        return this.getDFGArcsFromPetriNet().find(
            (dfgarc) =>
                dfgarc.getStart().name === arc.start.id &&
                dfgarc.getEnd().name === arc.end.id,
        );
    }

    public updateCollectedArcs(arc: Arc): void {
        const dfgArc: DfgArc = this.getDFGArc(arc)!;

        if (this._collectedArcs.getArcs().includes(dfgArc)) {
            const indexArcInCollectedArcs = this._collectedArcs
                .getArcs()
                .indexOf(dfgArc);

            this._collectedArcs.getArcs().splice(indexArcInCollectedArcs, 1);
        } else {
            this._collectedArcs.addArc(dfgArc);
        }

        if (this._collectedArcs.isEmpty()) {
            this._acutalDFG = undefined;
        } else {
            this._acutalDFG = this.getDFG(arc);
        }

        console.log(this._collectedArcs);
    }

    private getDFG(arc: Arc) {
        const dfgs = this.petriNet.transitions.getAllDFGs();

        for (const dfg of dfgs) {
            if (this.isArcinDFG(arc, dfg)) {
                return dfg;
            }
        }

        return undefined;
    }

    public isArcinDFG(arc: Arc, dfg: Dfg | undefined): boolean {
        const dfgArcToCheck = this.getDFGArc(arc);
        if (dfg !== undefined) {
            const arcInDFG: DfgArc | undefined =
                dfg.arcs.getArcByStartNameAndEndName(arc.start.id, arc.end.id);

            if (arcInDFG !== undefined) {
                return false;
            }
        }

        return true;
    }
}
