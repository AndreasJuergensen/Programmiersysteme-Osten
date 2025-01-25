import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToJsonExportablePetriNet } from '../classes/export/json/ToJsonExportablePetriNet';
import { ToPnExportablePetriNet } from '../classes/export/pn/ToPnExportablePetriNet';
import { ToPnmlExportablePetriNet } from '../classes/export/pnml/ToPnmlExportablePetriNet';
import { PetriNet } from '../classes/petrinet/petri-net';
import { PetriNetManagementService } from './petri-net-management.service';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    private _petriNet: PetriNet = new PetriNet();

    constructor(private petriNetManagementService: PetriNetManagementService) {
        this.petriNetManagementService.petriNet$.subscribe((petriNet) => {
            this._petriNet = petriNet;
        });
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

    exportPnml() {
        const filename = 'petri-net.pnml';
        this.export(
            new File(
                [
                    ToPnmlExportablePetriNet.fromPetriNet(
                        this._petriNet,
                    ).asPnml(),
                ],
                filename,
                {
                    type: 'application/pnml',
                },
            ),
            filename,
        );
    }
}
