import { Injectable } from '@angular/core';
import { CalculateDfgService } from './calculate-dfg.service';

@Injectable({
    providedIn: 'root',
})
export class ExecuteCutService {
    constructor(
        private calculateDfgService: CalculateDfgService,
        // private validationService: ValidationService,
    ) {}

    public cut(selectedCut: string): void {
        console.log('cut durchgefuehrt!' + ' selected Cut: ' + selectedCut);
        // if (this.validationService.xxx()) {return this.calculateDfgService().dfgbuilder....}
        //else {console.error 'kein valider Cut'}
    }

    // Methode, um Kanten einzulesen
    getSelectedArcsFromDrawingArea(): void {}

    // Kanten / Cut an Service zur Ueberpruefung weitergeben
    // auf Ueberpruefung warten

    // true --> DFG aktualsieren + Feedback erfolgreicher Cut durchgefuehrt

    // false --> Feedback kein Cut durchgefuehrt, erneut pruefen + ausgewaehlte Cuts ausgewaehlt lassen
}
