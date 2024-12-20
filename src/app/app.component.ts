import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EventLogDialogComponent } from './components/event-log-dialog/event-log-dialog.component';
import { EventLog } from './classes/event-log';
import { Subscription } from 'rxjs';
import { ShowFeedbackService } from './services/show-feedback.service';
import { CalculatePetriNetService } from './services/calculate-petri-net.service';
import { PetriNet } from './classes/petrinet/petri-net';
import { DfgBuilder } from './classes/dfg/dfg';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    constructor(
        private _matDialog: MatDialog,
        private feedbackService: ShowFeedbackService,
        private pnCalculationService: CalculatePetriNetService,
    ) {}

    public openDialog(): void {
        const config: MatDialogConfig = { width: '800px' };
        const dialogRef = this._matDialog.open<
            EventLogDialogComponent,
            MatDialogConfig,
            EventLog
        >(EventLogDialogComponent, config);

        const sub: Subscription = dialogRef.afterClosed().subscribe({
            next: (result) => console.log(result),
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

    // This method is for test purposes only!
    // Remove after connection all pieces!
    public createTestPN(): void {
        const dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('X')
            .createActivity('Y')
            .createActivity('Z')
            .addFromPlayArc('A')
            .addFromPlayArc('X')
            .addArc('A', 'B')
            .addArc('X', 'Y')
            .addArc('Y', 'Z')
            .addToStopArc('B')
            .addToStopArc('Z')
            .build();
        const petriNet: PetriNet = new PetriNet(dfg);

        this.pnCalculationService.calculatePetriNet(petriNet);
    }
}
