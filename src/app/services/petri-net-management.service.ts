import { Injectable } from '@angular/core';
import { PetriNet } from '../classes/petrinet/petri-net';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dfg } from '../classes/dfg/dfg';
import { ShowFeedbackService } from './show-feedback.service';
import { CollectArcsService } from './collect-arcs.service';
import _ from 'lodash';

@Injectable({
    providedIn: 'root',
})
export class PetriNetManagementService {
    private _petriNet: PetriNet = new PetriNet();
    private _previousPetriNets: PetriNet[] = [];
    private _isModifiable: boolean = false;
    private _isInputPetriNet: boolean = true;

    private _petriNet$: BehaviorSubject<PetriNet> =
        new BehaviorSubject<PetriNet>(this._petriNet);

    constructor(private _showFeedbackService: ShowFeedbackService) {}

    public initialize(dfg: Dfg): void {
        this._petriNet = new PetriNet(dfg);
        this._previousPetriNets = [];
        this._isInputPetriNet = true;
        if (this._petriNet.isBasicPetriNet()) {
            this._isModifiable = false;
            this._showFeedbackService.showMessage(
                'There is nothing to split on this event log.',
                false,
            );
        } else {
            this._isModifiable = true;
        }
        this._petriNet$.next(this._petriNet);
    }

    public updatePnByExclusiveCut(
        originDFG: Dfg,
        subDFG1: Dfg,
        subDFG2: Dfg,
    ): void {
        this.addPreviousPetriNet();
        this._petriNet.updateByExclusiveCut(originDFG, subDFG1, subDFG2);
        this.updatePn();
    }

    public updatePnBySequenceCut(
        originDFG: Dfg,
        subDFG1: Dfg,
        subDFG2: Dfg,
    ): void {
        this.addPreviousPetriNet();
        this._petriNet.updateBySequenceCut(originDFG, subDFG1, subDFG2);
        this.updatePn();
    }

    public updatePnByParallelCut(
        originDFG: Dfg,
        subDFG1: Dfg,
        subDFG2: Dfg,
    ): void {
        this.addPreviousPetriNet();
        this._petriNet.updateByParallelCut(originDFG, subDFG1, subDFG2);
        this.updatePn();
    }

    public updatePnByLoopCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): void {
        this.addPreviousPetriNet();
        this._petriNet.updateByLoopCut(originDFG, subDFG1, subDFG2);
        this.updatePn();
    }

    public updatePnByFlowerFallThrough(dfg: Dfg, subDFGs: Dfg[]) {
        this.addPreviousPetriNet();
        this._petriNet.updateByFlowerFallThrough(dfg, subDFGs);
        this.updatePn();
    }

    updateToPreviousPetriNet(): void {
        const prevPetriNet: PetriNet | undefined =
            this._previousPetriNets.pop();
        if (prevPetriNet !== undefined) {
            this._petriNet = prevPetriNet;
            this.updatePn();
        }
    }

    private updatePn(): void {
        if (this._petriNet.isBasicPetriNet()) {
            this._isModifiable = false;
            this._showFeedbackService.showMessage(
                'The event log is completely splitted.',
                false,
            );
        } else {
            this._isModifiable = true;
        }
        if (this._previousPetriNets.length === 0) {
            this._isInputPetriNet = true;
        } else {
            this._isInputPetriNet = false;
        }
        this._petriNet$.next(this._petriNet);
    }

    private addPreviousPetriNet(): void {
        const petriNetCopy: PetriNet = _.cloneDeep(this._petriNet);
        this._previousPetriNets.push(petriNetCopy);
    }

    get petriNet$(): Observable<PetriNet> {
        return this._petriNet$.asObservable();
    }

    get isModifiable(): boolean {
        return this._isModifiable;
    }

    get isInputPetriNet(): boolean {
        return this._isInputPetriNet;
    }
}
