import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarPopupComponent } from '../components/feedback-components/custom-snackbar-popup/custom-snackbar-popup.component';

@Injectable({
    providedIn: 'root',
})
export class ShowFeedbackService {
    constructor(private snackbar: MatSnackBar) {}

    showMessage(message: string, isError: boolean): void {
        this.snackbar.openFromComponent(CustomSnackbarPopupComponent, {
            data: { message, isError },
            duration: isError ? 0 : 10000,
            panelClass: isError ? 'error-snackbar' : 'success-snackbar',
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    }

    showInitialMessage(message: string, isError: boolean): void {
        this.snackbar.openFromComponent(CustomSnackbarPopupComponent, {
            data: { message, isError },
            duration: isError ? 0 : 0,
            panelClass: isError ? 'error-snackbar' : 'success-snackbar',
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    }
}
