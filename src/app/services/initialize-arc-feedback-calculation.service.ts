import { Injectable } from '@angular/core';
import { PetriNetManagementService } from './petri-net-management.service';
import { PetriNet } from '../classes/petrinet/petri-net';

@Injectable({
    providedIn: 'root',
})
export class InitializeArcFeedbackCalculationService {
    private _petriNet!: PetriNet;

    constructor(private petriNetManagementService: PetriNetManagementService) {
        this.petriNetManagementService.petriNet$.subscribe((petriNet) => {
            this._petriNet = petriNet;
        });
    }

    public async initialize(): Promise<void> {
        this._petriNet.getDFGs().forEach((dfg) => {
            dfg.startProcessing();
        });
    }
}
