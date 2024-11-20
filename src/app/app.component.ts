import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EventLogDialogComponent } from './components/event-log-dialog/event-log-dialog.component';
import { EventLog } from './classes/event-log';
import { Subscription } from 'rxjs';
import { PopupComponent } from './components/popup/popup.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    constructor(private _matDialog: MatDialog) {}

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

    //TODO: Klärung, an welcher Stelle wir die Daten übergeben wollen
    //      Mein Vorschlag: hier mit der openPopup-Methode
    public openPopup(messageForPopup: string): void {
        const config: MatDialogConfig = {
            width: '400px',
            data: { message: messageForPopup },
        };
        const popupRef = this._matDialog.open<PopupComponent, MatDialogConfig>(
            PopupComponent,
            config,
        );

        const sub: Subscription = popupRef.afterClosed().subscribe({
            next: (result) => console.log(result),
            complete: () => sub.unsubscribe(),
        });
    }
}
