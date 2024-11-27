import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    MAT_SNACK_BAR_DATA,
    MatSnackBarRef,
} from '@angular/material/snack-bar';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';
import { CommonModule } from '@angular/common';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';

@Component({
    selector: 'app-custom-popup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './custom-popup.component.html',
    styleUrl: './custom-popup.component.css',
})
export class CustomPopupComponent implements OnInit {
    constructor(
        private dialog: MatDialog,
        public snackBarRef: MatSnackBarRef<CustomPopupComponent>,
        @Inject(MAT_SNACK_BAR_DATA)
        public data: { message: string; isError: boolean },
        private feedbackService: ShowFeedbackService,
    ) {}

    openForm(): void {
        this.feedbackService.openFormWithIndividualInput();
    }

    closePopUp(): void {
        this.snackBarRef.dismiss();
    }

    ngOnInit(): void {
        if (this.data.isError) {
            setTimeout(() => this.snackBarRef.dismiss(), 30000); // Automatisch nach 30 Sekunden schließen
        }
    }
}
