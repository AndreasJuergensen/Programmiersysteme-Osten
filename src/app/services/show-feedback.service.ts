import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class ShowFeedbackService {
    constructor(private snackbar: MatSnackBar) {}

    showMessage(message: string, isSuccess: boolean): void {
        this.snackbar.open(message, '', {
            duration: 5000,
            panelClass: isSuccess ? 'success-snackbar' : 'error-snackbar',
        });
    }
}
