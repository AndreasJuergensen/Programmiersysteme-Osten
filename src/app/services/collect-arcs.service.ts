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

@Injectable({
    providedIn: 'root',
})
export class CollectArcsService {
    constructor() {}
    private petriNet!: PetriNet;
    private _collectedArcs: Arcs = new Arcs();
    private _acutalDFG = undefined;

    // private petriNetManagementService: PetriNetManagementService =
    //     new PetriNetManagementService();
    // private _sub = this.petriNetManagementService.petriNet$.subscribe(
    //     (petriNetSub) => {
    //         this.petriNet = petriNetSub;
    //     },
    // );

    // const petriNet =
    //dfg = new DfgBuilder().build();
    //petriNet = new PetriNet(this.dfg);

    //

    get collectedArcs(): Arcs {
        return this._collectedArcs;
    }

    public isValidArc(arc: Arc): boolean {
        if (this._acutalDFG === undefined) {
            //setze actualDFG auf DFG
        }

        if (true) {
            //wenn Arc in actualDFG
            return true;
        }

        return false;
    }

    //Arcs von DFG holen und nicht von Petri-Netz
    public updateCollectedArcs(arc: Arc): void {
        let dfgArc: DfgArc; //getDFGArc(arc)

        if (this._collectedArcs.getArcs().includes(dfgArc)) {
            const indexArcInCollectedArcs = this._collectedArcs
                .getArcs()
                .indexOf(dfgArc);
            this._collectedArcs.getArcs().splice(indexArcInCollectedArcs);
        }

        if (this._collectedArcs.isEmpty()) {
            this._acutalDFG = undefined;
        }
    }
}
