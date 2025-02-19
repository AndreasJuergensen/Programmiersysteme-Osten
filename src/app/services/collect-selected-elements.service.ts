import { Injectable } from '@angular/core';
import { Arcs, CategorizedArcs, DfgArc } from '../classes/dfg/arcs';
import { PetriNet } from '../classes/petrinet/petri-net';
import { Dfg } from '../classes/dfg/dfg';
import { Arc } from '../components/drawing-area/models';
import { PetriNetManagementService } from './petri-net-management.service';
import { Activities, Activity } from '../classes/dfg/activities';
import { CutType } from './execute-cut.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CollectSelectedElementsService {
    private _petriNet!: PetriNet;
    private _collectedArcs: Arcs = new Arcs();
    private _correctArcs: Arcs = new Arcs();
    private _PossiblyCorrectArcs: Arcs = new Arcs();
    private _wrongArcs: Arcs = new Arcs();
    private _currentCollectedArcsDFG: Dfg | undefined;
    private _selectedActivity: Activity | undefined;
    private _selectedDFGBox: Dfg | undefined;
    private _isElementSelected$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    private _selectedDFGBoxId$: BehaviorSubject<string | undefined> =
        new BehaviorSubject<string | undefined>(undefined);
    private _arcClassListAttributes: Map<string, string[]> = new Map<
        string,
        string[]
    >();

    constructor(private petriNetManagementService: PetriNetManagementService) {
        this.petriNetManagementService.petriNet$.subscribe((petriNetSub) => {
            this._petriNet = petriNetSub;
            this.resetSelectedElements();
        });
    }

    get collectedArcs(): Arcs {
        return this._collectedArcs;
    }

    get currentCollectedArcsDFG(): Dfg | undefined {
        return this._currentCollectedArcsDFG;
    }

    get selectedActivity(): Activity | undefined {
        return this._selectedActivity === undefined
            ? undefined
            : this._selectedActivity;
    }

    get selectedDFG(): Dfg | undefined {
        return this._selectedDFGBox === undefined
            ? undefined
            : this._selectedDFGBox;
    }

    get isElementSelected$() {
        return this._isElementSelected$.asObservable();
    }

    get selectedDFGBoxId$() {
        return this._selectedDFGBoxId$.asObservable();
    }

    isAnyElementSelected(): void {
        if (
            this._currentCollectedArcsDFG !== undefined ||
            this._selectedActivity !== undefined ||
            this._selectedDFGBox !== undefined
        ) {
            this._isElementSelected$.next(true);
            return;
        }
        this._isElementSelected$.next(false);
    }

    selectedDFGBox(): void {
        if (this._selectedDFGBox !== undefined) {
            this._selectedDFGBoxId$.next(this._selectedDFGBox?.id);
        } else {
            this._selectedDFGBoxId$.next(undefined);
        }
    }

    /**
     * @param {String} arcId Format: "arc_<start.id>_<end.id>"
     * @returns Array mit allen Class List Attributen
     */
    getArcClassListAttributes(arcId: string): Array<string> | undefined {
        return this._arcClassListAttributes.get(arcId);
    }

    setArcClassListAttributes(arcId: string, attribute: string) {
        const classListAttributes: Array<string> | undefined =
            this._arcClassListAttributes.get(arcId);

        if (classListAttributes) {
            if (!classListAttributes.includes(attribute)) {
                classListAttributes.push(attribute);
            }
            this._arcClassListAttributes.set(arcId, classListAttributes);
        } else {
            this._arcClassListAttributes.set(arcId, [`${attribute}`]);
        }
    }

    removeArcClassListAttributes(arcId: string, attribute: string) {
        const classListAttributes: Array<string> | undefined =
            this._arcClassListAttributes.get(arcId);

        if (classListAttributes) {
            const indexOfEntry: number = classListAttributes.indexOf(attribute);
            classListAttributes.splice(indexOfEntry, 1);
        }
    }

    toggleArcClassListAttributes(arcId: string, attribute: string) {
        const classListAttributes: Array<string> | undefined =
            this._arcClassListAttributes.get(arcId);

        if (classListAttributes) {
            if (!classListAttributes.includes(attribute)) {
                classListAttributes.push(attribute);
            } else {
                const indexOfEntry: number =
                    classListAttributes.indexOf(attribute);
                classListAttributes.splice(indexOfEntry, 1);
            }
            this._arcClassListAttributes.set(arcId, classListAttributes);
        } else {
            this._arcClassListAttributes.set(arcId, [`${attribute}`]);
        }
    }

    resetArcClassListAttributes(): void {
        this._arcClassListAttributes.clear();
    }

    updateSelectedActivity(activityName: string): void {
        if (
            this._selectedActivity !== undefined &&
            this._selectedActivity.name === activityName
        ) {
            this._selectedActivity = undefined;
            this.isAnyElementSelected();
            return;
        }
        for (const dfg of this._petriNet.getDFGs()) {
            if (dfg.activities.containsActivityWithName(activityName)) {
                this._selectedActivity =
                    dfg.activities.getActivityByName(activityName);
            }
        }
        this.isAnyElementSelected();
    }

    public setArcFeedback(selectedCut: CutType): void {
        const validatedArcs: CategorizedArcs =
            this._currentCollectedArcsDFG!.validateSelectedArcs(
                this._collectedArcs,
                selectedCut,
            );

        this._correctArcs = validatedArcs.correctArcs;
        this._PossiblyCorrectArcs = validatedArcs.possiblyCorrectArcs;
        this._wrongArcs = validatedArcs.wrongArcs;
    }

    updateSelectedDFG(clickedBoxName: string): void {
        if (
            this._selectedDFGBox !== undefined &&
            this._selectedDFGBox.id === clickedBoxName
        ) {
            this._selectedDFGBox = undefined;
            this.isAnyElementSelected();
            this.selectedDFGBox();
            return;
        }
        for (const dfg of this._petriNet.getDFGs()) {
            if (dfg.id === clickedBoxName) {
                this._selectedDFGBox = dfg;
            }
        }
        this.isAnyElementSelected();
        this.selectedDFGBox();
    }

    public resetSelectedElements(): void {
        this.resetSelectedArcs();
        this.resetSelectedActivity();
        this.resetSelectedDFGBox();
    }

    resetSelectedArcs(): void {
        this._collectedArcs = new Arcs();
        this._currentCollectedArcsDFG = undefined;
        this.isAnyElementSelected();
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
            this.resetArcClassListAttributes();
        }
    }

    resetSelectedActivity(): void {
        this._selectedActivity = undefined;
        this.isAnyElementSelected();
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg) {
            const activities = svg.querySelectorAll('rect');
            activities.forEach((activity) => {
                activity.classList.remove('activity-marked');
            });
        }
    }

    resetSelectedDFGBox(): void {
        this._selectedDFGBox = undefined;
        this.isAnyElementSelected();
        this.selectedDFGBox();
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg) {
            const boxes = svg.querySelectorAll('rect');
            boxes.forEach((box) => {
                box.classList.remove('box-marked');
            });
        }
    }

    public enableArcFeedback(): void {
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

                if (isCollectedArc && isCorrectArc && arcId) {
                    if (path.classList.contains('possiblyCorrect')) {
                        this.removeArcClassListAttributes(
                            arcId,
                            'possiblyCorrect',
                        );
                    }
                    if (path.classList.contains('wrong')) {
                        this.removeArcClassListAttributes(arcId, 'wrong');
                    }
                    this.setArcClassListAttributes(arcId, 'correct');

                    if (path.classList.contains('visiblePath')) {
                        path.setAttribute(
                            'marker-end',
                            'url(#arrowhead-green)',
                        );
                    }
                } else if (isCollectedArc && isPossibleCorrectArc && arcId) {
                    if (path.classList.contains('correct')) {
                        this.removeArcClassListAttributes(arcId, 'correct');
                    }
                    if (path.classList.contains('wrong')) {
                        this.removeArcClassListAttributes(arcId, 'wrong');
                    }
                    this.setArcClassListAttributes(arcId, 'possbiblyCorrect');
                    if (path.classList.contains('visiblePath')) {
                        path.setAttribute(
                            'marker-end',
                            'url(#arrowhead-orange)',
                        );
                    }
                } else if (isCollectedArc && isWrongArc && arcId) {
                    if (path.classList.contains('correct')) {
                        this.removeArcClassListAttributes(arcId, 'correct');
                    }
                    if (path.classList.contains('possbiblyCorrect')) {
                        this.removeArcClassListAttributes(
                            arcId,
                            'possbiblyCorrect',
                        );
                    }
                    this.setArcClassListAttributes(arcId, 'wrong');
                    if (path.classList.contains('visiblePath')) {
                        path.setAttribute('marker-end', 'url(#arrowhead-red)');
                    }
                }
            });
        }
    }

    public disableArcFeedback(): void {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg) {
            const paths = svg.querySelectorAll('path');
            paths.forEach((path) => {
                const arcId = path.getAttribute('id')!;
                if (path.classList.contains('correct')) {
                    this.removeArcClassListAttributes(arcId, 'correct');
                }
                if (path.classList.contains('possbiblyCorrect')) {
                    this.removeArcClassListAttributes(
                        arcId,
                        'possbiblyCorrect',
                    );
                }
                if (path.classList.contains('wrong')) {
                    this.removeArcClassListAttributes(arcId, 'wrong');
                }
                if (
                    path.classList.contains('visiblePath') &&
                    path.classList.contains('active')
                ) {
                    path.setAttribute('marker-end', 'url(#arrowhead-pale)');
                }
            });
        }
    }

    private getDFGArcsFromPetriNet(): Array<DfgArc> {
        const dfgArcs = new Array<DfgArc>();
        const dfgs = this._petriNet.transitions.getAllDFGs();

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
        if (this._currentCollectedArcsDFG !== undefined) {
            const arcInDFG: DfgArc | undefined =
                this._currentCollectedArcsDFG.arcs.getArcByStartNameAndEndName(
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
            this._currentCollectedArcsDFG = undefined;
        } else {
            this._currentCollectedArcsDFG = this.getDFG(arc);
        }
        this.isAnyElementSelected();
    }

    private getDFG(arc: Arc): Dfg | undefined {
        const dfgs = this._petriNet.transitions.getAllDFGs();

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

    public isOverlayedArcInDFG(arc: Arc): boolean {
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
