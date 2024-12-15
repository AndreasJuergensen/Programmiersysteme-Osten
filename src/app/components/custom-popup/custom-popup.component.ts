import { Component, Inject } from '@angular/core';
import {
    MAT_SNACK_BAR_DATA,
    MatSnackBarRef,
} from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';

@Component({
    selector: 'app-custom-popup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './custom-popup.component.html',
    styleUrl: './custom-popup.component.css',
})
export class CustomPopupComponent {
    constructor(
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
}
