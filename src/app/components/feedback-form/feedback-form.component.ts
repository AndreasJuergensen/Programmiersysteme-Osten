import { Component, ViewEncapsulation } from '@angular/core';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SimValidateCutService } from 'src/app/services/sim-validate-cut.service';

@Component({
    selector: 'app-feedback-form',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './feedback-form.component.html',
    styleUrl: './feedback-form.component.css',
    encapsulation: ViewEncapsulation.None,
})
export class FeedbackFormComponent {
    userInput: string = '';

    constructor(
        private dialogRef: MatDialogRef<FeedbackFormComponent>,
        private feedbackService: ShowFeedbackService,
        private simValidateCutService: SimValidateCutService,
    ) {}

    handleInput(): void {
        const isValid = this.simValidateCutService.validateInput(
            this.userInput,
        );

        if (isValid) {
            this.feedbackService.showMessage(
                `valid Input: ${this.userInput}`,
                false,
            );
            this.dialogRef.close({ isValid, input: this.userInput });
        } else {
            this.feedbackService.showMessage('invalid Input', true);
        }
    }

    closeDialog(): void {
        this.feedbackService.showMessage('Dialog closed without input.', true);
        this.dialogRef.close();
    }
}
