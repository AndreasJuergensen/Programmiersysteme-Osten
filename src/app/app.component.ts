import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EventLogDialogComponent } from './components/event-log-dialog/event-log-dialog.component';
import { EventLog } from './classes/event-log';
import { Subscription } from 'rxjs';
import { CalculateDfgService } from './services/calculate-dfg.service';
import { Dfg } from './classes/dfg/dfg';
import { PetriNetManagementService } from './services/petri-net-management.service';
import { ShowFeedbackService } from './services/show-feedback.service';
import { FallThroughHandlingService } from './services/fall-through-handling.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    constructor(
        private _matDialog: MatDialog,
        private _calculateDfgService: CalculateDfgService,
        private _petriNetManagementService: PetriNetManagementService,
        private _feedbackService: ShowFeedbackService,
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
