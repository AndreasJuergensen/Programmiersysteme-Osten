import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-feedback-dialog',
    standalone: true,
    imports: [MatButtonModule],
    templateUrl: './feedback-dialog.component.html',
    styleUrl: './feedback-dialog.component.css',
})
export class FeedbackDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<FeedbackDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { details: string },
    ) {}

    closeDialog(): void {
        this.dialogRef.close();
    }
}
