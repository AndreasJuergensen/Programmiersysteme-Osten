import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CustomSnackbarPopupComponent } from '../components/feedback-components/custom-snackbar-popup/custom-snackbar-popup.component';

@Injectable({
    providedIn: 'root',
})
export class ShowFeedbackService {
    constructor(private snackbar: MatSnackBar) {}

    /*
    kann in jeder(m) beliebigen Komponenten bzw. Service aufgerufen werden,
    um individuell Success-/Error Popups zu erzeugen
    Für den Fall eines Errors kann man optional noch eine detaillierte 
    Beschreibung als string mitgeben 
    */
    showMessage(message: string, isError: boolean): void {
        this.snackbar.openFromComponent(CustomSnackbarPopupComponent, {
            data: { message, isError },
            duration: isError ? 7000 : 7000,
            panelClass: isError ? 'error-snackbar' : 'success-snackbar',
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    }
}
