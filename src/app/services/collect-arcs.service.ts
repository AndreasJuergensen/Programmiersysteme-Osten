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
    private _currentDFG: Dfg | undefined;

    // arcIsActive: boolean = false;

    constructor(private petriNetManagementService: PetriNetManagementService) {
        this.petriNetManagementService.petriNet$.subscribe((petriNetSub) => {
            this.petriNet = petriNetSub;
            this.resetCollectedArcs();
        });
    }

    get collectedArcs(): Arcs {
        return this._collectedArcs;
    }

    get currentDFG(): Dfg | undefined {
        return this._currentDFG;
    }

    public resetCollectedArcs(): void {
        // console.log('Vor Reset:');
        // console.log(this._collectedArcs);
        // console.log(this._currentDFG);
        this._collectedArcs = new Arcs();
        this._currentDFG = undefined;

        this.resetClickedElements();

        // console.log('Nach Reset:');
        // console.log(this._collectedArcs);
        // console.log(this._currentDFG);
    }

    private resetClickedElements(): void {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg) {
            const lines = svg.querySelectorAll('line');
            lines.forEach((line) => {
                line.classList.remove('active');
                line.classList.remove('hovered');
                line.setAttribute('marker-end', 'url(#arrowhead)');
            });
        }
        // const elements = document.getElementsByTagName('line');
        // Array.from(elements).forEach((element) => {
        //     element.style.stroke = '';
        // });
        // this.arcIsActive = false;
        // document.getElementById("mySvg") as SVGSVGElement;
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
        if (this._currentDFG !== undefined) {
            const arcInDFG: DfgArc | undefined =
                this._currentDFG.arcs.getArcByStartNameAndEndName(
                    arc.start.id,
                    arc.end.id,
                );

            if (arcInDFG !== undefined) {
                return true;
            }

            return false;
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
        // console.log('dfgarc: ');
        // console.log(dfgArc);

        if (this._collectedArcs.getArcs().includes(dfgArc)) {
            const indexArcInCollectedArcs = this._collectedArcs
                .getArcs()
                .indexOf(dfgArc);

            this._collectedArcs.getArcs().splice(indexArcInCollectedArcs, 1);
        } else {
            this._collectedArcs.addArc(dfgArc);
        }

        if (this._collectedArcs.isEmpty()) {
            // console.log('CollectedArcsIsEmpty');

            this._currentDFG = undefined;
        } else {
            this._currentDFG = this.getDFG(arc);
        }

        // console.log(this._collectedArcs);
        // console.log(this._currentDFG);
    }

    private getDFG(arc: Arc): Dfg | undefined {
        const dfgs = this.petriNet.transitions.getAllDFGs();
        // console.log(dfgs);

        for (const dfg of dfgs) {
            if (this.isArcinDFG(arc, dfg)) {
                // console.log('ArcInDFG');

                return dfg;
            }
        }

        return undefined;
    }

    public isArcinDFG(arc: Arc, dfg: Dfg | undefined): boolean {
        const dfgArcToCheck = this.getDFGArc(arc);
        // console.log('DfgArcToCheck:');
        // console.log(dfgArcToCheck);

        // console.log('DFG: ');
        // console.log(dfg);

        if (dfg !== undefined) {
            const arcInDFG: DfgArc | undefined =
                dfg.arcs.getArcByStartNameAndEndName(arc.start.id, arc.end.id);

            // console.log('ArcFromDFG');
            // console.log(arcInDFG);

            if (arcInDFG !== undefined) {
                return true;
            }
        }

        return false;
    }
}
