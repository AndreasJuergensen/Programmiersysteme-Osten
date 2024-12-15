import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EventLogDialogComponent } from './components/event-log-dialog/event-log-dialog.component';
import { EventLog } from './classes/event-log';
import { Subscription } from 'rxjs';
import { ShowFeedbackService } from './services/show-feedback.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    constructor(
        private _matDialog: MatDialog,
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
}
