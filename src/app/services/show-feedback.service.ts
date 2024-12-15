import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomPopupComponent } from '../components/custom-popup/custom-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from '../components/feedback-dialog/feedback-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class ShowFeedbackService {
    private detailedFormMessage: string | null = null;

    constructor(
        private snackbar: MatSnackBar,
        private dialog: MatDialog,
    ) {}

    showMessage(message: string, isError: boolean, details?: string): void {
        if (isError && details) {
            this.detailedFormMessage = details;
        }

        this.snackbar.openFromComponent(CustomPopupComponent, {
            data: { message, isError },
            duration: isError ? 0 : 5000,
            panelClass: isError ? 'error-snackbar' : 'success-snackbar',
        });
    }

    openFormWithIndividualInput(): void {
        if (this.detailedFormMessage) {
            this.dialog.open(FeedbackDialogComponent, {
                data: { details: this.detailedFormMessage },
                width: '400px',
            });
        }
    }

    openHelDialog(details: string): void {
        this.dialog.open(FeedbackDialogComponent, {
            data: { details },
            width: '600px',
        });
    }
}
