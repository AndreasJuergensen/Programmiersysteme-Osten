import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EventLogDialogComponent } from './components/event-log-dialog/event-log-dialog.component';
import { EventLog } from './classes/event-log';
import { Subscription } from 'rxjs';
import { CalculateDfgService } from './services/calculate-dfg.service';
import { Dfg } from './classes/dfg/dfg';
import { PetriNetManagementService } from './services/petri-net-management.service';
import { ShowFeedbackService } from './services/show-feedback.service';
import { CalculatePetriNetService } from './services/calculate-petri-net.service';
import { PetriNet } from './classes/petrinet/petri-net';

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
        private feedbackService: ShowFeedbackService,
    ) {}

    public openDialog(): void {
        const config: MatDialogConfig = { width: '800px' };
        const dialogRef = this._matDialog.open<
            EventLogDialogComponent,
            MatDialogConfig,
            EventLog
        >(EventLogDialogComponent, config);

        const sub: Subscription = dialogRef.afterClosed().subscribe({
            next: (eventLog) => {
                if (eventLog === undefined) {
                    return;
                }

                const dfg: Dfg = this._calculateDfgService.calculate(eventLog);
                this._petriNetManagementService.initialize(dfg);
            },
            complete: () => sub.unsubscribe(),
        });
    }

    public openHelp(): void {
        // hier könnte man ggfs. nähere Informationen zur Anwendung platzieren
        // oder dynmaisch je nach aktuellem Bearbeitungsstand des Users unterschiedlcihe
        // Hilfestellungen geben

        const helpMessage = `
      Willkommen im Hilfe-Bereich! 
      Hier finden Sie Informationen und Anleitungen zur Nutzung dieser Anwendung. 
      Wenn Sie weitere Fragen haben, kontaktieren Sie bitte unseren Support.
    `;

        this.feedbackService.openHelpDialog(helpMessage);
    }
}
