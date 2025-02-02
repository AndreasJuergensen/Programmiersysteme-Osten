import { Injectable } from '@angular/core';
import { PetriNetManagementService } from './petri-net-management.service';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Arcs } from '../classes/dfg/arcs';

@Injectable({
    providedIn: 'root',
})
export class ApplicationStateService {
    private _isPetriNetEmpty$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    private _isBasicPetriNet$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    private _isInputPetriNet$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    private _showEventLogs$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    private _showArcFeedback$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    private _isArcFeedbackReady$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    private _collectedArcs$: BehaviorSubject<Arcs> = new BehaviorSubject<Arcs>(
        new Arcs(),
    );

    constructor(private petriNetManagementService: PetriNetManagementService) {
        this.petriNetManagementService.petriNet$.subscribe((petriNet) => {
            this._isPetriNetEmpty$.next(petriNet.isEmpty());
            this._isBasicPetriNet$.next(petriNet.isBasicPetriNet());
        });
        this.petriNetManagementService.petriNet$.subscribe((petriNet) => {
            const dfgObservables = petriNet
                .getDFGs()
                .map((dfg) => dfg.arcFeedbackCalculationState$);

            combineLatest(dfgObservables)
                .pipe(map((states) => states.every((state) => state)))
                .subscribe((allReady) => {
                    this._isArcFeedbackReady$.next(allReady);
                });
        });
        this.petriNetManagementService.isInputPetriNet$.subscribe(
            (isInputPetriNet) => {
                this._isInputPetriNet$.next(isInputPetriNet);
            },
        );
    }

    get isPetriNetEmpty$() {
        return this._isPetriNetEmpty$.asObservable();
    }

    get isBasicPetriNet$() {
        return this._isBasicPetriNet$.asObservable();
    }

    get isInputPetriNet$() {
        return this._isInputPetriNet$.asObservable();
    }

    get showEventLogs$() {
        return this._showEventLogs$.asObservable();
    }

    get showArcFeedback$() {
        return this._showArcFeedback$.asObservable();
    }

    get isArcFeedbackReady$() {
        return this._isArcFeedbackReady$.asObservable();
    }

    get collectedArcs$() {
        return this._collectedArcs$.asObservable();
    }

    toggleShowEventLogs() {
        this._showEventLogs$.next(!this._showEventLogs$.value);
    }

    toggleShowArcFeedback() {
        this._showArcFeedback$.next(!this._showArcFeedback$.value);
    }

    setCollectedArcs(arcs: Arcs) {
        this._collectedArcs$.next(arcs);
    }

    resetCollectedArcs() {
        this._collectedArcs$.next(new Arcs());
    }
}
