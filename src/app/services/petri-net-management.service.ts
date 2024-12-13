import { Injectable } from '@angular/core';
import { PetriNet } from '../classes/petrinet/petri-net';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dfg } from '../classes/dfg/dfg';
import { Activities } from '../classes/dfg/activities';
import { EventLog } from '../classes/event-log';
import { Arcs } from '../classes/dfg/arcs';
import { cutType } from '../components/cut-execution/cut-execution.component';

@Injectable({
    providedIn: 'root',
})
export class PetriNetManagementService {
    private _petriNet: PetriNet = new PetriNet(
        new Dfg(new Activities(), new Arcs(), new EventLog()),
    );

    private _petriNet$: BehaviorSubject<PetriNet> =
        new BehaviorSubject<PetriNet>(this._petriNet);

    get petriNet$(): Observable<PetriNet> {
        return this._petriNet$.asObservable();
    }

    constructor() {}

    public initialize(dfg: Dfg): void {
        this._petriNet = new PetriNet(dfg);
        this._petriNet$.next(this._petriNet);
    }

    public updatePn(): void {
        this._petriNet$.next(this._petriNet);
    }

    updatePnByExclusiveCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): void {
        this._petriNet.updateByExclusiveCut(originDFG, subDFG1, subDFG2);
    }

    updatePnBySequenceCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): void {
        this._petriNet.updateBySequenceCut(originDFG, subDFG1, subDFG2);
    }

    updatePnByParalleleCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): void {
        this._petriNet.updateByParallelCut(originDFG, subDFG1, subDFG2);
    }

    updatePnByLoopCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): void {
        this._petriNet.updateByLoopCut(originDFG, subDFG1, subDFG2);
    }
}