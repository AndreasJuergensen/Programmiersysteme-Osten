import { Injectable } from '@angular/core';
import { PetriNetManagementService } from './petri-net-management.service';
import { BehaviorSubject } from 'rxjs';

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

    constructor(private petriNetManagementService: PetriNetManagementService) {
        this.petriNetManagementService.petriNet$.subscribe((petriNet) => {
            this._isPetriNetEmpty$.next(petriNet.isEmpty());
            this._isBasicPetriNet$.next(petriNet.isBasicPetriNet());
        });
        this.petriNetManagementService.isInputPetriNet$.subscribe((isInputPetriNet) => {
            this._isInputPetriNet$.next(isInputPetriNet);
        });
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
}
