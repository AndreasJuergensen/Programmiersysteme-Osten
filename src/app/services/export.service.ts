import { Injectable } from '@angular/core';
import { PetriNet } from '../classes/petrinet/petri-net';
import { PetriNetManagementService } from './petri-net-management.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToPnExportablePetriNet } from '../classes/export/pn/ToPnExportablePetriNet';
import { ToJsonExportablePetriNet } from '../classes/export/json/ToJsonExportablePetriNet';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    private _petriNet: PetriNet = new PetriNet();
    private _isPetriNetExportable$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);

    constructor(private petriNetManagementService: PetriNetManagementService) {
        this.petriNetManagementService.petriNet$.subscribe((petriNet) => {
            this._petriNet = petriNet;
            this._isPetriNetExportable$.next(
                this.isPetriNetExportable(petriNet),
            );
        });
    }

    get isPetriNetExportable$(): Observable<boolean> {
        return this._isPetriNetExportable$.asObservable();
    }

    private isPetriNetExportable(petriNet: PetriNet): boolean {
        return petriNet.isBasicPetriNet() && !petriNet.isEmpty();
    }

    private export(file: File, fileName: string) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    exportPn() {
        const filename = 'petri-net.pn';
        this.export(
            new File(
                ToPnExportablePetriNet.fromPetriNet(
                    this._petriNet,
                ).asStringArray(),
                filename,
                {
                    type: 'text/plain',
                },
            ),
            filename,
        );
    }

    exportJson() {
        const filename = 'petri-net.json';
        this.export(
            new File(
                [
                    ToJsonExportablePetriNet.fromPetriNet(
                        this._petriNet,
                    ).asJson(),
                ],
                filename,
                {
                    type: 'application/json',
                },
            ),
            filename,
        );
    }
}
