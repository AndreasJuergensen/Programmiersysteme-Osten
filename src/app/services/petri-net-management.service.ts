import { Injectable } from '@angular/core';
import { PetriNet } from '../classes/petrinet/petri-net';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dfg } from '../classes/dfg/dfg';
import { ShowFeedbackService } from './show-feedback.service';
import _ from 'lodash';
import { Arc } from '../components/drawing-area/models';

@Injectable({
    providedIn: 'root',
})
export class PetriNetManagementService {
    private _petriNet: PetriNet = new PetriNet();
    private _previousPetriNets: PetriNet[] = [];
    private _isModifiable: boolean = false;
    private _isInputPetriNet$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(true);
    private _petriNet$: BehaviorSubject<PetriNet> =
        new BehaviorSubject<PetriNet>(this._petriNet);
    private _initialEventLog: string = '';
    private _recentEventLogs$: BehaviorSubject<string[]> = new BehaviorSubject<
        string[]
    >([]);

    constructor(private _showFeedbackService: ShowFeedbackService) {}

    public initialize(dfg: Dfg): void {
        const eventLog: string = dfg.eventLog.toString();
        this._initialEventLog = eventLog;
        this.updateRecentEventLogs(eventLog);
        this._petriNet = new PetriNet(dfg);
        this._previousPetriNets = [];
        this._isInputPetriNet$.next(true);
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

    private updateRecentEventLogs(eventLog: string): void {
        const recentEventLogs = [...this._recentEventLogs$.value];
        const newLength = recentEventLogs.unshift(eventLog);
        if (newLength > 5) recentEventLogs.pop();
        this._recentEventLogs$.next(recentEventLogs);
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
        } else {
            this._isModifiable = true;
        }
        if (this._previousPetriNets.length === 0) {
            this._isInputPetriNet$.next(true);
        } else {
            this._isInputPetriNet$.next(false);
        }
        this._petriNet$.next(this._petriNet);
    }

    private addPreviousPetriNet(): void {
        const petriNetCopy: PetriNet = _.cloneDeep(this._petriNet);
        this._previousPetriNets.push(petriNetCopy);
    }

    showEventLogCompletelySplitted(): void {
        this._showFeedbackService.showMessage(
            'The event log is completely splitted.',
            false,
        );
    }

    get petriNet$(): Observable<PetriNet> {
        return this._petriNet$.asObservable();
    }

    get isModifiable(): boolean {
        return this._isModifiable;
    }

    get isInputPetriNet$() {
        return this._isInputPetriNet$.asObservable();
    }

    public arcIsOverlayingArc(arc: Arc): boolean {
        const overlayArc = this._petriNet.arcs.arcs.filter(
            (arcInPetriNet) =>
                arcInPetriNet.start.id === arc.end.id &&
                arcInPetriNet.end.id === arc.start.id,
        );

        if (overlayArc.length > 0) {
            return true;
        }

        return false;
    }

    get initialEventLog(): string {
        return this._initialEventLog;
    }

    get recentEventLogs$() {
        return this._recentEventLogs$.asObservable();
    }
}
