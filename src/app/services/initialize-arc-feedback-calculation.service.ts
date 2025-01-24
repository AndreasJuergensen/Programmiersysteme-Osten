import { Injectable } from '@angular/core';
import { PetriNetManagementService } from './petri-net-management.service';
import { PetriNet } from '../classes/petrinet/petri-net';

@Injectable({
    providedIn: 'root',
})
export class InitializeArcFeedbackCalculationService {
    private _petriNet!: PetriNet;
    private worker!: Worker;

    constructor(private petriNetManagementService: PetriNetManagementService) {
        this.petriNetManagementService.petriNet$.subscribe((petriNet) => {
            this._petriNet = petriNet;
        });

        // Initialize the Web Worker
        if (typeof Worker !== 'undefined') {
            this.worker = new Worker(
                new URL(
                    '../workers/initialize-arc-feedback-calculation.worker',
                    import.meta.url,
                ),
            );
        } else {
            console.error('Web Workers are not supported in this environment.');
        }
    }

    // public async initialize(): Promise<void> {
    //     console.log('initialize');

    //     console.log(this._petriNet);
    //     await new Promise<void>(() => {
    //         setTimeout(() => {
    //             this._petriNet.getDFGs().forEach((dfg) => {
    //                 dfg.startProcessing();
    //             });
    //         }, 0);
    //     });
    // }

    public async initialize(): Promise<void> {
        if (!this.worker) {
            throw new Error('Web Worker not initialized.');
        }

        // Send data to the worker
        this.worker.postMessage(this._petriNet);

        return new Promise<void>((resolve, reject) => {
            this.worker.onmessage = ({ data }) => {
                if (data === 'done') {
                    console.log('Processing completed in Web Worker.');
                    resolve();
                }
            };

            this.worker.onerror = (error) => {
                console.error('Error in Web Worker:', error);
                reject(error);
            };
        });
    }
}
