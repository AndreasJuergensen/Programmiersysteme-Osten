import { Component } from '@angular/core';
import { ShowFeedbackService } from 'src/app/services/show-feedback.service';

@Component({
    selector: 'app-trigger-popup',
    standalone: true,
    imports: [],
    templateUrl: './trigger-popup.component.html',
    styleUrl: './trigger-popup.component.css',
})
export class TriggerPopupComponent {
    constructor(private feedbackService: ShowFeedbackService) {}

    triggerSnackbarSuccess(): void {
        this.feedbackService.showMessage('works!', false);
    }

    triggerSnackbarError(): void {
        this.feedbackService.showMessage(
            'errooooor',
            true,
            'dies ist eine detaillierte Beschreibung von etwas......',
        );
    }
}
