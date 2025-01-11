import { Injectable } from '@angular/core';
import { Arcs, CategorizedArcs, DfgArc } from '../classes/dfg/arcs';
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
import { CutType } from '../components/cut-execution/cut-execution.component';

@Injectable({
    providedIn: 'root',
})
export class CollectArcsService {
    private petriNet!: PetriNet;
    private _collectedArcs: Arcs = new Arcs();
    private _currentDFG: Dfg | undefined;
    private _correctArcs: Arcs = new Arcs();
    private _PossiblyCorrectArcs: Arcs = new Arcs();
    private _wrongArcs: Arcs = new Arcs();

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
        this._collectedArcs = new Arcs();
        this._currentDFG = undefined;

        this.resetClickedElements();
    }

    public setCorrectArcs(selectedCut: CutType): void {
        const validatedArcs: CategorizedArcs =
            this._currentDFG!.validateSelectedArcs(
                this._collectedArcs,
                selectedCut,
            );

        this._correctArcs = validatedArcs.correctArcs;
        this._PossiblyCorrectArcs = validatedArcs.possiblyCorrectArcs;
        this._wrongArcs = validatedArcs.wrongArcs;

        this.markArcs();
    }

    private resetClickedElements(): void {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg) {
            const paths = svg.querySelectorAll('path');
            paths.forEach((path) => {
                path.classList.remove('active');
                path.classList.remove('hovered');
                path.classList.remove('correct');
                path.classList.remove('possbiblyCorrect');
                path.classList.remove('wrong');
                if (path.classList.contains('visiblePath')) {
                    path.setAttribute('marker-end', 'url(#arrowhead)');
                }
            });
        }
    }

    private markArcs(): void {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg) {
            const paths = svg.querySelectorAll('path');
            paths.forEach((path) => {
                const arcId = path.getAttribute('id');
                const isCollectedArc = this._collectedArcs
                    .getArcs()
                    .some(
                        (arc) =>
                            `arc_${arc.asJson().start}_${arc.asJson().end}` ===
                            arcId,
                    );
                const isCorrectArc = this._correctArcs
                    .getArcs()
                    .some(
                        (arc) =>
                            `arc_${arc.asJson().start}_${arc.asJson().end}` ===
                            arcId,
                    );

                const isPossibleCorrectArc = this._PossiblyCorrectArcs
                    .getArcs()
                    .some(
                        (arc) =>
                            `arc_${arc.asJson().start}_${arc.asJson().end}` ===
                            arcId,
                    );

                const isWrongArc = this._wrongArcs
                    .getArcs()
                    .some(
                        (arc) =>
                            `arc_${arc.asJson().start}_${arc.asJson().end}` ===
                            arcId,
                    );

                if (isCollectedArc && isCorrectArc) {
                    path.classList.add('correct');
                    if (path.classList.contains('visiblePath')) {
                        path.setAttribute(
                            'marker-end',
                            'url(#arrowhead-green)',
                        );
                    }
                } else if (isCollectedArc && isPossibleCorrectArc) {
                    path.classList.add('possbiblyCorrect');
                    if (path.classList.contains('visiblePath')) {
                        path.setAttribute(
                            'marker-end',
                            'url(#arrowhead-orange)',
                        );
                    }
                } else if (isCollectedArc && isWrongArc) {
                    path.classList.add('wrong');
                    if (path.classList.contains('visiblePath')) {
                        path.setAttribute('marker-end', 'url(#arrowhead-red)');
                    }
                }
            });
        }
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

        if (this._collectedArcs.getArcs().includes(dfgArc)) {
            const indexArcInCollectedArcs = this._collectedArcs
                .getArcs()
                .indexOf(dfgArc);

            this._collectedArcs.getArcs().splice(indexArcInCollectedArcs, 1);
        } else {
            this._collectedArcs.addArc(dfgArc);
        }

        if (this._collectedArcs.isEmpty()) {
            this._currentDFG = undefined;
        } else {
            this._currentDFG = this.getDFG(arc);
        }
    }

    private getDFG(arc: Arc): Dfg | undefined {
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
                return true;
            }
        }

        return false;
    }

    public overlayArcsExistsInDFGs(arc: Arc): boolean {
        const dfgOfArc = this.getDFG(arc);

        if (dfgOfArc) {
            const overlayArcs = dfgOfArc.arcs
                .getArcs()
                .filter(
                    (arcInDFG) =>
                        arcInDFG.getStart().name === arc.end.id &&
                        arcInDFG.getEnd().name === arc.start.id,
                );

            if (overlayArcs.length > 0) {
                return true;
            }
        }

        return false;
    }
}
