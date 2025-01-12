import { Component, OnInit } from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EventLog } from 'src/app/classes/event-log';
import { EventLogParserService } from 'src/app/services/event-log-parser.service';
import { CommonModule } from '@angular/common';
import { EventLogValidationService } from 'src/app/services/event-log-validation.service';
import { ParseXesService } from 'src/app/services/parse-xes.service';

@Component({
    selector: 'app-event-log-dialog',
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        CommonModule,
        MatTooltipModule,
        MatIcon,
    ],
    templateUrl: './event-log-dialog.component.html',
    styleUrl: './event-log-dialog.component.css',
})
export class EventLogDialogComponent implements OnInit {
    public eventLogControl = new FormControl('', {
        validators: [
            Validators.required,
            this.validateFormControlInput.bind(this),
        ],
        updateOn: 'change',
    });

    constructor(
        private dialogRef: MatDialogRef<EventLogDialogComponent, EventLog>,
        private eventLogParserService: EventLogParserService,
        private eventLogValidationService: EventLogValidationService,
        private parseXesService: ParseXesService,
    ) {}

    public fileName: string = '';

    ngOnInit(): void {
        this.eventLogControl.markAsTouched();
        this.eventLogControl.updateValueAndValidity();
    }

    private validateFormControlInput(
        control: FormControl,
    ): { [key: string]: boolean } | null {
        const input = control.value;

        if (input && input.includes('*')) {
            return { invalidCharacter: true };
        }

        if (input && /[^A-Za-z0-9\+\s\*]/.test(input)) {
            return { otherInvalidCharacter: true };
        }

        if (input) {
            setTimeout(() => {
                if (!this.eventLogValidationService.validateInput(input)) {
                    control.setErrors({ invalidInput: true });
                }
            }, 0);
        }
        return null;
    }

    public onOkClick(): void {
        if (this.eventLogControl.invalid) {
            return;
        }

        const eventLog: EventLog = this.eventLogParserService.parse(
            this.eventLogControl.value!,
        );

        this.dialogRef.close(eventLog);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            if (this.eventLogControl.valid) {
                this.onOkClick();
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const textarea = event.target as HTMLTextAreaElement;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const value = textarea.value;
            textarea.value =
                value.substring(0, start) + '\n' + value.substring(end);

            textarea.selectionStart = textarea.selectionEnd = start + 1;
        }
    }

    clearTextarea(textarea: HTMLTextAreaElement): void {
        this.eventLogControl.setValue('');
        this.eventLogControl.markAsTouched();
        this.eventLogControl.updateValueAndValidity();

        textarea.focus();
    }
    public onFileSelected(event: any): void {
        const file: File = event.target.files[0];

        if (file) {
            this.fileName = file.name;
            file.text().then((content) => {
                this.eventLogControl.setValue(
                    this.parseXesService.parse(content),
                );
            });
        }
    }
}
