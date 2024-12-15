import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from '../components/feedback-components/feedback-dialog/feedback-dialog.component';
import { CustomSnackbarPopupComponent } from '../components/feedback-components/custom-snackbar-popup/custom-snackbar-popup.component';

@Injectable({
    providedIn: 'root',
})
export class ShowFeedbackService {
    private detailedFormMessage: string | null = null;

    constructor(
        private snackbar: MatSnackBar,
        private dialog: MatDialog,
    ) {}

    /*
    kann in jeder(m) beliebigen Komponenten bzw. Service aufgerufen werden,
    um individuell Success-/Error Popups zu erzeugen
    Für den Fall eines Errors kann man optional noch eine detaillierte 
    Beschreibung als string mitgeben 
    */
    showMessage(message: string, isError: boolean, details?: string): void {
        if (isError && details) {
            this.detailedFormMessage = details;
        }

        this.snackbar.openFromComponent(CustomSnackbarPopupComponent, {
            data: { message, isError },
            duration: isError ? 0 : 5000,
            panelClass: isError ? 'error-snackbar' : 'success-snackbar',
        });
    }

    openFormWithIndividualInput(): void {
        if (this.detailedFormMessage) {
            this.dialog.open(FeedbackDialogComponent, {
                data: { details: this.detailedFormMessage },
                width: 'auto',
            });
        }
    }

    openHelpDialog(details: string): void {
        this.dialog.open(FeedbackDialogComponent, {
            data: { details },
            width: 'auto',
        });
    }
}
