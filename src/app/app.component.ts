import { Component } from '@angular/core';
import { FallThroughHandlingService } from './services/fall-through-handling.service';
import { PetriNetManagementService } from './services/petri-net-management.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    constructor(
        private _petriNetManagementService: PetriNetManagementService,
        private _fallThroughHandlingService: FallThroughHandlingService,
    ) {}

    activityOncePerTraceExecution(): void {
        this._fallThroughHandlingService.executeActivityOncePerTraceFallThrough();
    }

    flowerExecution() {
        this._fallThroughHandlingService.executeFlowerFallThrough();
    }

    get actionButtonsAreDisabled(): boolean {
        return !this._petriNetManagementService.isModifiable;
    }

    get undoButtonIsDisabled(): boolean {
        return false;
    }
}
